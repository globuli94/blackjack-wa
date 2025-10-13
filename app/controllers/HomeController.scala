package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import controller.controllerComponent.ControllerInterface

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(
  val controllerComponents: ControllerComponents,
  blackjackController: ControllerInterface
  ) extends BaseController {
    
    /*
    private val tui: TUI = TUI(controller)
    private val tuiThread = new Thread(() => {
      tui.startInteractive()
    })
    tuiThread.setDaemon(true)
    tuiThread.start()
    */
  
  def index() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.index(blackjackController.toString))
  }

    // Game control
  def loadGame() = Action { implicit request: Request[AnyContent] =>
    blackjackController.loadGame()
    val gameState = blackjackController.toString
    Ok(views.html.index(gameState))
  }

  def saveGame() = Action { implicit request: Request[AnyContent] =>
    blackjackController.saveGame()
    val gameState = blackjackController.toString
    Ok(views.html.index(gameState))
  }

  def initializeGame() = Action { implicit request: Request[AnyContent] =>
    blackjackController.initializeGame()
    val gameState = blackjackController.toString
    Ok(views.html.index(gameState))
  }

  def startGame() = Action { implicit request: Request[AnyContent] =>
    blackjackController.startGame()
    val gameState = blackjackController.toString
    Ok(views.html.index(gameState))
  }

  def exit() = Action { implicit request: Request[AnyContent] =>
    blackjackController.exit()
    val gameState = blackjackController.toString
    Ok(views.html.index(gameState))
  }

  // Player management
  def addPlayer() = Action { implicit request: Request[AnyContent] =>
    val input = request.body.asFormUrlEncoded.getOrElse(Map.empty)
    val name = input.get("name").flatMap(_.headOption).getOrElse("Player")
    blackjackController.addPlayer(name)
    val gameState = blackjackController.toString
    Ok(views.html.index(gameState))
  }

  def leavePlayer() = Action { implicit request: Request[AnyContent] =>
    blackjackController.leavePlayer()
    val gameState = blackjackController.toString
    Ok(views.html.index(gameState))
  }

  // Game actions
  def hitNextPlayer() = Action { implicit request: Request[AnyContent] =>
    blackjackController.hitNextPlayer()
    val gameState = blackjackController.toString
    Ok(views.html.index(gameState))
  }

  def standNextPlayer() = Action { implicit request: Request[AnyContent] =>
    blackjackController.standNextPlayer()
    val gameState = blackjackController.toString
    Ok(views.html.index(gameState))
  }

  def doubleDown() = Action { implicit request: Request[AnyContent] =>
    blackjackController.doubleDown()
    val gameState = blackjackController.toString
    Ok(views.html.index(gameState))
  }

  def bet() = Action { implicit request: Request[AnyContent] =>
    val input = request.body.asFormUrlEncoded.getOrElse(Map.empty)
    val amount = input.get("amount").flatMap(_.headOption).getOrElse("10")
    blackjackController.bet(amount)
    val gameState = blackjackController.toString
    Ok(views.html.index(gameState))
  }

  def command() = Action { implicit request: Request[AnyContent] =>
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
      case "exit" =>
        blackjackController.exit()
      case _ =>
    }
    
    val gameState = blackjackController.toString
    val cleanGameState = gameState.replaceAll("\\u001b\\[\\d+m", "")

    Ok(views.html.index(gameState))
  }
}