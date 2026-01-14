package auth

import play.api.mvc._
import play.api.libs.json.Json
import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}


case class AuthenticatedRequest[A](userId: String, request: Request[A]) extends WrappedRequest[A](request)


class AuthenticatedAction @Inject()(
  val parser: BodyParsers.Default,
  firebaseAuthService: FirebaseAuthService
)(implicit val executionContext: ExecutionContext)
    extends ActionBuilder[AuthenticatedRequest, AnyContent] {

  override def invokeBlock[A](
    request: Request[A],
    block: AuthenticatedRequest[A] => Future[Result]
  ): Future[Result] = {

    request.headers.get("Authorization") match {
      case Some(authHeader) if authHeader.startsWith("Bearer ") =>
        val token = authHeader.substring(7) // Remove "Bearer " prefix

        firebaseAuthService.verifyToken(token).flatMap { decodedToken =>
          val userId = decodedToken.getUid
          block(AuthenticatedRequest(userId, request))
        }.recoverWith {
          case e: Exception =>
            Future.successful(
              Results.Unauthorized(Json.obj(
                "success" -> false,
                "message" -> "Invalid or expired authentication token",
                "error" -> e.getMessage
              ))
            )
        }

      case Some(_) =>
        Future.successful(
          Results.Unauthorized(Json.obj(
            "success" -> false,
            "message" -> "Invalid Authorization header format. Expected: Bearer <token>"
          ))
        )

      case None =>
        Future.successful(
          Results.Unauthorized(Json.obj(
            "success" -> false,
            "message" -> "Missing Authorization header"
          ))
        )
    }
  }
}
