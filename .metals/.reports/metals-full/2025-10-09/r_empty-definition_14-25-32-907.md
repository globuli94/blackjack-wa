error id: file://<WORKSPACE>/build.sbt:`<none>`.
file://<WORKSPACE>/build.sbt
empty definition using pc, found symbol in pc: `<none>`.
empty definition using semanticdb
empty definition using fallback
non-local guesses:
	 -aggregate.
	 -aggregate#
	 -aggregate().
	 -scala/Predef.aggregate.
	 -scala/Predef.aggregate#
	 -scala/Predef.aggregate().
offset: 308
uri: file://<WORKSPACE>/build.sbt
text:
```scala
name := """blackjack-wa"""
organization := "glob"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

val scalaVersion := "3.5.1"

lazy val root = (project in file("."))
  .settings(name := "blackjack-wa",scalaVersion := scalaVersion)
  .dependsOn(blackjack)
  .aggre@@gate(blackjack)


libraryDependencies += guice
libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "7.0.2" % Test

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "glob.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "glob.binders._"

```


#### Short summary: 

empty definition using pc, found symbol in pc: `<none>`.