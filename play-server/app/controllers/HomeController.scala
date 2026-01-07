package controllers

import controller.controllerComponent.ControllerInterface
import javax.inject.*
import play.api.*
import play.api.mvc.*
import play.api.libs.json._
import _root_.util.fileIOComponent.JSON.FileIOJSON

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.actor.{Actor, ActorRef, Props}
import play.api.libs.streams.ActorFlow
import _root_.util.{Event, Observer}

import scala.concurrent.ExecutionContextExecutor
import scala.concurrent.duration.*

/**
 * This controller handles WebSocket connections and JSON API endpoints
 * for the Blackjack game backend.
 */
@Singleton
class HomeController @Inject()(
  val controllerComponents: ControllerComponents,
  blackjackController: ControllerInterface
) (implicit system: ActorSystem) extends BaseController {

  // Create FileIOJSON instance to access its implicit JSON formatters
  private val fileIO = new FileIOJSON()
  import fileIO._  // This imports all the implicit JSON formatters (gameWrites, playerWrites, etc.)

  /*
   * Sets up websocket endpoint where client sends string and server replies string messages
   * creates new BlackjackActor when client connects to handle client
   * actorRef is the connection to the client -> everything sent via out is sent to the client
   */
  def socket: WebSocket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      println("Connect received")
      BlackjackWebSocketActorFactory.create(out, this.blackjackController)
    }
  }

  // factory that creates the actor
  private object BlackjackWebSocketActorFactory {
    def create(out: ActorRef, controller: ControllerInterface): Props = {
      println("Creating actor")
      Props(new BlackjackWebSocketActor(out, controller))
    }
  }

  /*
   * This class handles messages for one web socket client
   * parameter out represents the endpoint to the client
   *
   * func receive always runs when actor receives message from the client
   *   -> currently ignores message from client and returns game json back to client
   *
   * func sendJsonToClient
   *   -> pushes current game state to client
   */
  private class BlackjackWebSocketActor(out: ActorRef, controller: ControllerInterface) extends Actor with Observer {
    implicit val ec: ExecutionContextExecutor = context.dispatcher
    context.system.scheduler.scheduleWithFixedDelay(30.seconds, 30.seconds, self, "heartbeat")

    // Register this actor as observer
    override def preStart(): Unit = {
      controller.add(this)
    }

    def receive: Receive = {
      case "heartbeat" =>
        out ! "ping"
      case msg: String =>
        if(msg == "getState") {
          out ! blackjackController.serialize
        }
        println("Client message: " + msg)
    }

    private def sendJsonToClient(): Unit = {
      println("Received event from Controller")
      out ! (blackjackController.serialize)
    }

    override def update(e: Event): Unit = {
      sendJsonToClient()
    }
  }

  private def gameToJson(): JsValue = {
    Json.toJson(blackjackController.getGame)
  }

  def getGameStateJson(): Action[AnyContent] = Action {
    Ok(gameToJson())
  }

  def addPlayerJson(): Action[AnyContent] = Action { implicit request =>
    request.body.asFormUrlEncoded.flatMap(_.get("PlayerForm").flatMap(_.headOption)) match {
      case Some(name) if name.trim.nonEmpty =>
        blackjackController.addPlayer(name.trim)
        Ok(Json.obj(
          "success" -> true,
          "message" -> s"Player $name added",
          "gameState" -> gameToJson()
        ))
      case _ =>
        BadRequest(Json.obj(
          "success" -> false, 
          "message" -> "Invalid player name"
        ))
    }
  }

  def betJson(): Action[AnyContent] = Action { implicit request =>
    request.body.asFormUrlEncoded.flatMap(_.get("BetForm").flatMap(_.headOption)) match {
      case Some(betStr) =>
        try {
          blackjackController.bet(betStr)
          Ok(Json.obj(
            "success" -> true,
            "gameState" -> gameToJson()
          ))
        } catch {
          case _: NumberFormatException =>
            BadRequest(Json.obj(
              "success" -> false, 
              "message" -> "Invalid bet amount"
            ))
        }
      case _ =>
        BadRequest(Json.obj(
          "success" -> false, 
          "message" -> "Bet amount required"
        ))
    }
  }

  def hitJson(): Action[AnyContent] = Action {
    blackjackController.hitNextPlayer()
    Ok(Json.obj(
      "success" -> true,
      "gameState" -> gameToJson()
    ))
  }

  def standJson(): Action[AnyContent] = Action {
    blackjackController.standNextPlayer()
    Ok(Json.obj(
      "success" -> true,
      "gameState" -> gameToJson()
    ))
  }

  def doubleDownJson(): Action[AnyContent] = Action {
    blackjackController.doubleDown()
    Ok(Json.obj(
      "success" -> true,
      "gameState" -> gameToJson()
    ))
  }

  def leavePlayerJson(): Action[AnyContent] = Action {
    blackjackController.leavePlayer()
    Ok(Json.obj(
      "success" -> true,
      "gameState" -> gameToJson()
    ))
  }

  def initializeGameJson(): Action[AnyContent] = Action {
    blackjackController.initializeGame()
    Ok(Json.obj(
      "success" -> true,
      "gameState" -> gameToJson()
    ))
  }

  def startGameJson(): Action[AnyContent] = Action {
    blackjackController.startGame()
    Ok(Json.obj(
      "success" -> true,
      "gameState" -> gameToJson()
    ))
  }
}
