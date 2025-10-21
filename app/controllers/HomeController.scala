package controllers

import controller.controllerComponent.ControllerInterface
import io.jsonwebtoken.impl.AndroidBase64Codec

import javax.inject.*
import play.api.*
import play.api.mvc.*
import view.TUI

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(
                                val controllerComponents: ControllerComponents,
                                blackjackController: ControllerInterface
                              ) extends BaseController {


  private val tui: TUI = TUI(blackjackController)
  private val tuiThread = new Thread(() => {
    var input: String = ""
    val tui = TUI(blackjackController)  // pass injected controller

    while (input != "exit") {
      input = scala.io.StdIn.readLine()   // blocks this thread only
      tui.getInputAndPrintLoop(input)     // handle the input
    }
  })
  tuiThread.setDaemon(true)
  tuiThread.start()

  def index(): Action[AnyContent] = Action {implicit request: Request[AnyContent] =>
    Ok(views.html.blackjack.apply(blackjackController))
  }

  def serialize(): Action[AnyContent] = Action {implicit request: Request[AnyContent] =>
    Ok(views.html.index.apply(blackjackController.toString, blackjackController.serialize))
  }

  def initializeGame(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    blackjackController.initializeGame()
    Ok(views.html.blackjack.apply(blackjackController))
  }

  def addPlayerForm(): Action[AnyContent] = Action {implicit request: Request[AnyContent] =>
    Ok(views.html.addPlayerForm.apply())
  }

  def addPlayer(): Action[AnyContent] = Action {implicit request: Request[AnyContent] =>
    val player_name_input = request.body
      .asFormUrlEncoded
      .flatMap(_.get("PlayerForm").flatMap(_.headOption))
      .getOrElse("")

    blackjackController.addPlayer(player_name_input)
    Ok(views.html.blackjack.apply(blackjackController))
  }

  def command(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    val command_input = request.getQueryString("command").getOrElse("")
    val parts = command_input.split(" ")
    val command = if (parts.nonEmpty) parts(0) else ""
    val command_arg = if (parts.length > 1) parts(1) else ""

    command match {
      case "add" =>
        blackjackController.addPlayer(command_arg)
      case "start" =>
        blackjackController.startGame()
      case "continue" =>
        blackjackController.startGame()
      case "hit" =>
        blackjackController.hitNextPlayer()
      case "stand" =>
        blackjackController.standNextPlayer()
      case "bet" =>
        blackjackController.bet(command_arg)
      case "leave" =>
        blackjackController.leavePlayer()
      case "exit" =>
        blackjackController.exit()
      case "serialize" =>
      case _ =>
    }

    Ok(views.html.index(blackjackController.toString, blackjackController.serialize))
  }

  def toHistory(): Action[AnyContent] = Action {implicit request: Request[AnyContent] =>
    Ok(views.html.history())
  }
}