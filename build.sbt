name := """blackjack-wa"""
organization := "glob"

version := "1.0-SNAPSHOT"
scalaVersion := "3.5.1"

lazy val blackjack = ProjectRef(file("blackjack"), "root")

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

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "glob.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "glob.binders._"
