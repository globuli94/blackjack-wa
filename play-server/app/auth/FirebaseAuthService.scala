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
        // 1. Use environment variable (for Heroku/production)
        logger.info("Using Firebase credentials from FIREBASE_JSON environment variable")
        val serviceStream = new ByteArrayInputStream(firebaseJson.getBytes("UTF-8"))
        FirebaseOptions.builder()
          .setCredentials(GoogleCredentials.fromStream(serviceStream))
          .build()
      } else {
        // 2. Fallback: Try to read from local file (for local development)
        val serviceAccountPath = config.get[String]("firebase.serviceAccountKey")
        val serviceAccountFile = new java.io.File(serviceAccountPath)
        
        if (!serviceAccountFile.exists()) {
          val errorMsg = s"""
            |================================================================================
            |FIREBASE SERVICE ACCOUNT KEY NOT FOUND
            |================================================================================
            |The file '${serviceAccountPath}' does not exist.
            |
            |To fix this for LOCAL DEVELOPMENT:
            |1. Go to Firebase Console: https://console.firebase.google.com/
            |2. Select your project: blackjack-wa-login
            |3. Go to Project Settings > Service Accounts
            |4. Click "Generate new private key"
            |5. Save the JSON file as: ${serviceAccountPath}
            |   (The file should be in the play-server/ directory)
            |
            |OR set the FIREBASE_JSON environment variable with the JSON content:
            |   export FIREBASE_JSON='{"type":"service_account",...}'
            |
            |For PRODUCTION (Heroku), set the FIREBASE_JSON environment variable.
            |================================================================================
            """.stripMargin
          logger.error(errorMsg)
          throw new RuntimeException(s"Firebase service account key not found at: ${serviceAccountPath}. See logs above for instructions.")
        }
        
        logger.info(s"Using Firebase credentials from file: ${serviceAccountPath}")
        val serviceAccount = new FileInputStream(serviceAccountFile)
        FirebaseOptions.builder()
          .setCredentials(GoogleCredentials.fromStream(serviceAccount))
          .build()
      }

      // Important: Check if an instance is already running (prevents errors on hot-reload)
      if (FirebaseApp.getApps.isEmpty) {
        val app = FirebaseApp.initializeApp(options)
        logger.info("Firebase Admin SDK initialized successfully")
        app
      } else {
        logger.info("Firebase Admin SDK already initialized, reusing existing instance")
        FirebaseApp.getInstance()
      }
      
    } catch {
      case e: java.io.FileNotFoundException =>
        logger.error("Firebase service account key file not found. See error message above for setup instructions.", e)
        throw e
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
