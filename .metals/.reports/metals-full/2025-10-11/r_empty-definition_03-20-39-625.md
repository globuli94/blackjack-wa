error id: file://<WORKSPACE>/blackjack/src/main/scala/Main.scala:`<none>`.
file://<WORKSPACE>/blackjack/src/main/scala/Main.scala
empty definition using pc, found symbol in pc: `<none>`.
empty definition using semanticdb
empty definition using fallback
non-local guesses:
	 -model/handComponent/Array#
	 -model/cardComponent/Array#
	 -Array#
	 -scala/Predef.Array#
offset: 714
uri: file://<WORKSPACE>/blackjack/src/main/scala/Main.scala
text:
```scala
import controller.controllerComponent.ControllerInterface
import view.{GUI, TUI}
import com.google.inject.{Guice, Injector}

import scala.collection.immutable.LazyList.cons
import scala.io.StdIn.readLine
import model.handComponent.*
import model.cardComponent.*
import model.gameComponent.GameInterface
import util.fileIOComponent.JSON.FileIOJSON

import scala.collection.immutable.Queue

object Main {
  private val injector: Injector = Guice.createInjector(new BlackjackModule)
  private val controller: ControllerInterface = injector.getInstance(classOf[ControllerInterface])
  private val tui: TUI = TUI(controller)
  private val gui: GUI = GUI(controller)

  print(controller.toString)

  def main(args: Array@@[String]): Unit = {

    var input: String = ""

    while(input != "exit") {
      input = readLine();
      tui.getInputAndPrintLoop(input)
    }
  }
}
```


#### Short summary: 

empty definition using pc, found symbol in pc: `<none>`.