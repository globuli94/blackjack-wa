package modules

import com.google.inject.AbstractModule
import controller.controllerComponent.ControllerInterface
import controller.controllerComponent.Controller
import model.gameComponent.GameInterface
import model.gameComponent.Game

class BlackjackModule extends AbstractModule {
  override def configure(): Unit = {
    val game = new Game()
    bind(classOf[GameInterface]).toInstance(game)
    bind(classOf[ControllerInterface]).to(classOf[Controller])
  }
}