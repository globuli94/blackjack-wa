error id: file://<WORKSPACE>/app/controllers/HomeController.scala:`<none>`.
file://<WORKSPACE>/app/controllers/HomeController.scala
empty definition using pc, found symbol in pc: `<none>`.
empty definition using semanticdb
empty definition using fallback
non-local guesses:
	 -javax/inject/request.
	 -javax/inject/request#
	 -javax/inject/request().
	 -play/api/request.
	 -play/api/request#
	 -play/api/request().
	 -play/api/mvc/request.
	 -play/api/mvc/request#
	 -play/api/mvc/request().
	 -request.
	 -request#
	 -request().
	 -scala/Predef.request.
	 -scala/Predef.request#
	 -scala/Predef.request().
offset: 838
uri: file://<WORKSPACE>/app/controllers/HomeController.scala
text:
```scala
package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import blackjack.controller.controllerComponent.ControllerInterface

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(
  val controllerComponents: ControllerComponents,
  blackjackController: ControllerInterface
  ) extends BaseController {


    private val controller: ControllerInterface = blackjackController
    private val tui: TUI = TUI(controller)
    private val gui: GUI = GUI(controller)
  /**
   * Create an Action to render an HTML page.
   *
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index() = Action { implicit re@@quest: Request[AnyContent] =>
    Ok(views.html.index())
  }
}

```


#### Short summary: 

empty definition using pc, found symbol in pc: `<none>`.