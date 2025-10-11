name := """blackjack-wa"""
organization := "glob"
version := "1.0-SNAPSHOT"
scalaVersion := "3.5.1"

lazy val blackjack = (project in file("blackjack"))
  .settings(
    name := "blackjack",
    scalaVersion := "3.5.1",
    libraryDependencies ++= Seq(
      "org.scala-lang.modules" %% "scala-swing" % "3.0.0",
      "org.scalameta" %% "munit" % "1.0.0" % Test,
      "org.scalatest" %% "scalatest" % "3.2.18" % Test,
      "org.scalactic" %% "scalactic" % "3.2.18",
      "org.scalamock" %% "scalamock" % "6.0.0" % Test,
      "org.mockito" % "mockito-core" % "5.14.2" % Test,
      "com.google.inject" % "guice" % "6.0.0",
      "org.scala-lang.modules" %% "scala-xml" % "2.3.0",
      "com.typesafe.play" %% "play-json" % "2.10.5"
    )
  )

lazy val playserver = (project in file("."))
  .enablePlugins(PlayScala)
  .dependsOn(blackjack)
  .settings(
    name := "playserver",
    libraryDependencies ++= Seq(
      guice,
      "org.scalatestplus.play" %% "scalatestplus-play" % "7.0.2" % Test
    )
  )