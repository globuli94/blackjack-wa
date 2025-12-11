package modules

import com.google.inject.AbstractModule
import controller.controllerComponent.{Controller, ControllerInterface}
import model.gameComponent.{Game, GameInterface}
import util.fileIOComponent.FileIOInterface
import util.fileIOComponent.JSON.FileIOJSON
import util.fileIOComponent.XML.FileIOXML

class BlackjackModule extends AbstractModule {
  override def configure(): Unit = {
    val game = new Game()
    bind(classOf[GameInterface]).toInstance(game)
    bind(classOf[ControllerInterface]).to(classOf[Controller])
    
    // File IO binding
    bind(classOf[FileIOInterface]).to(classOf[FileIOJSON])
    // or
    // bind(classOf[FileIOInterface]).to(classOf[FileIOXML])
  }
}