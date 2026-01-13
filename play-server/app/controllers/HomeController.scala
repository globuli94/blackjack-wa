package controllers

import controller.controllerComponent.ControllerInterface
import auth.{AuthenticatedAction, AuthenticatedRequest}
import javax.inject.*
import play.api.*
import play.api.mvc.*
import play.api.libs.json._
import _root_.util.fileIOComponent.JSON.FileIOJSON

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.actor.{Actor, ActorRef, Props}
import play.api.libs.streams.ActorFlow
import _root_.util.{Event, Observer}

import scala.concurrent.{ExecutionContextExecutor, Future}
import scala.concurrent.duration.*

/**
 * This controller handles WebSocket connections and JSON API endpoints
 * for the Blackjack game backend with Firebase authentication.
 */
@Singleton
class HomeController @Inject()(
  val controllerComponents: ControllerComponents,
  blackjackController: ControllerInterface,
  authenticatedAction: AuthenticatedAction
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

  def getGameStateJson(): Action[AnyContent] = authenticatedAction.async { implicit request =>
    Future.successful(Ok(gameToJson()))
  }

  def addPlayerJson(): Action[AnyContent] = authenticatedAction.async { implicit request =>
    request.body.asFormUrlEncoded.flatMap(_.get("PlayerForm").flatMap(_.headOption)) match {
      case Some(name) if name.trim.nonEmpty =>
        blackjackController.addPlayer(name.trim)
        Future.successful(Ok(Json.obj(
          "success" -> true,
          "message" -> s"Player $name added",
          "userId" -> request.userId,
          "gameState" -> gameToJson()
        )))
      case _ =>
        Future.successful(BadRequest(Json.obj(
          "success" -> false,
          "message" -> "Invalid player name"
        )))
    }
  }

  def betJson(): Action[AnyContent] = authenticatedAction.async { implicit request =>
    request.body.asFormUrlEncoded.flatMap(_.get("BetForm").flatMap(_.headOption)) match {
      case Some(betStr) =>
        try {
          blackjackController.bet(betStr)
          Future.successful(Ok(Json.obj(
            "success" -> true,
            "userId" -> request.userId,
            "gameState" -> gameToJson()
          )))
        } catch {
          case _: NumberFormatException =>
            Future.successful(BadRequest(Json.obj(
              "success" -> false,
              "message" -> "Invalid bet amount"
            )))
        }
      case _ =>
        Future.successful(BadRequest(Json.obj(
          "success" -> false,
          "message" -> "Bet amount required"
        )))
    }
  }

  def hitJson(): Action[AnyContent] = authenticatedAction.async { implicit request =>
    blackjackController.hitNextPlayer()
    Future.successful(Ok(Json.obj(
      "success" -> true,
      "userId" -> request.userId,
      "gameState" -> gameToJson()
    )))
  }

  def standJson(): Action[AnyContent] = authenticatedAction.async { implicit request =>
    blackjackController.standNextPlayer()
    Future.successful(Ok(Json.obj(
      "success" -> true,
      "userId" -> request.userId,
      "gameState" -> gameToJson()
    )))
  }

  def doubleDownJson(): Action[AnyContent] = authenticatedAction.async { implicit request =>
    blackjackController.doubleDown()
    Future.successful(Ok(Json.obj(
      "success" -> true,
      "userId" -> request.userId,
      "gameState" -> gameToJson()
    )))
  }

  def leavePlayerJson(): Action[AnyContent] = authenticatedAction.async { implicit request =>
    blackjackController.leavePlayer()
    Future.successful(Ok(Json.obj(
      "success" -> true,
      "userId" -> request.userId,
      "gameState" -> gameToJson()
    )))
  }

  def initializeGameJson(): Action[AnyContent] = authenticatedAction.async { implicit request =>
    blackjackController.initializeGame()
    Future.successful(Ok(Json.obj(
      "success" -> true,
      "userId" -> request.userId,
      "gameState" -> gameToJson()
    )))
  }

  def startGameJson(): Action[AnyContent] = authenticatedAction.async { implicit request =>
    blackjackController.startGame()
    Future.successful(Ok(Json.obj(
      "success" -> true,
      "userId" -> request.userId,
      "gameState" -> gameToJson()
    )))
  }
}
