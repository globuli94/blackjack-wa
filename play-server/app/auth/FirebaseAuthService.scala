package auth

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.{FirebaseApp, FirebaseOptions}
import com.google.firebase.auth.{FirebaseAuth, FirebaseToken}
import javax.inject.{Inject, Singleton}
import play.api.{Configuration, Logger}
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Try, Success, Failure}
import java.io.FileInputStream
import java.io.ByteArrayInputStream

@Singleton
class FirebaseAuthService @Inject()(config: Configuration)(implicit ec: ExecutionContext) {
  private val logger = Logger(this.getClass)

  private val firebaseApp: FirebaseApp = {
    try {
      // 1. Versuche, den JSON-Inhalt aus der Umgebungsvariable zu lesen (Heroku-Weg)
      val firebaseJson = System.getenv("FIREBASE_JSON")

      val options = if (firebaseJson != null && firebaseJson.nonEmpty) {
        // Wenn die Variable existiert, nutze ByteArrayInputStream
        val serviceStream = new ByteArrayInputStream(firebaseJson.getBytes("UTF-8"))
        FirebaseOptions.builder()
          .setCredentials(GoogleCredentials.fromStream(serviceStream))
          .build()
      } else {
        // 2. Fallback: Lokale Datei nutzen (dein bisheriger Weg für sbt run)
        val serviceAccountPath = config.get[String]("firebase.serviceAccountKey")
        val serviceAccount = new FileInputStream(serviceAccountPath)
        FirebaseOptions.builder()
          .setCredentials(GoogleCredentials.fromStream(serviceAccount))
          .build()
      }

      // Wichtig: Prüfen, ob schon eine Instanz läuft (verhindert Fehler beim Hot-Reload)
      if (FirebaseApp.getApps.isEmpty) {
        FirebaseApp.initializeApp(options)
      } else {
        FirebaseApp.getInstance()
      }
      
    } catch {
      case e: Exception =>
        logger.error("Failed to initialize Firebase Admin SDK", e)
        throw e
    }
  }


  private val auth: FirebaseAuth = FirebaseAuth.getInstance(firebaseApp)

  /**
   * Verifies a Firebase ID token and returns the decoded token
   * @param idToken The Firebase ID token from the client
   * @return Future containing the decoded FirebaseToken if valid
   */
  def verifyToken(idToken: String): Future[FirebaseToken] = {
    Future {
      Try {
        auth.verifyIdToken(idToken)
      } match {
        case Success(decodedToken) =>
          logger.info(s"Token verified successfully for user: ${decodedToken.getUid}")
          decodedToken
        case Failure(exception) =>
          logger.error(s"Token verification failed: ${exception.getMessage}")
          throw exception
      }
    }
  }

  /**
   * Gets the user ID (UID) from a verified token
   * @param idToken The Firebase ID token
   * @return Future containing the user ID if token is valid
   */
  def getUserId(idToken: String): Future[String] = {
    verifyToken(idToken).map(_.getUid)
  }

  /**
   * Gets user email from a verified token
   * @param idToken The Firebase ID token
   * @return Future containing the user email if available
   */
  def getUserEmail(idToken: String): Future[Option[String]] = {
    verifyToken(idToken).map(token => Option(token.getEmail))
  }
}
