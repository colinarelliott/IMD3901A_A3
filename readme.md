# IMD3901A (Design Studio 3) - Assignment 3 - Multi-User Interaction
**Colin Elliott - 101073994**

---

#### Prompt:
This repository contains code for an assignment related to one of my university courses. It's an A-Frame NodeJS application. Here's the prompt:
- "Create a WebXR application that allows two participants to collaborate and compete in an interactive space that includes interaction feedback (e.g., visual, aural, and/or haptic)."
- Must include a system connecting 2 users via WebSockets
- Must include at least 1 collaborative multi-user interaction
- Must include at least 1 competitive multi-user interaction
- Visual feedback is essential, demonstrate the state of the system

#### Idea:
- make a crane board game where each player controls a crane and has to collect containers and load a ship
- competitive mode: play against each other, see who can collect the most
- co-op mode: play with each other collecting as many as possible during a time limit

---

## Reflection:
WOW I gave myself wayyyy too much scope for this project. I wanted to have multi-colored containers, more decoration, more precise picking up and putting down mechanics and more but I ended up cutting a lot of stuff. I underestimated how much time it would take to debug everything with a server and two clients in the mix. It was like I had to develop every piece twice, first for basic functionality and second for syncing to the server. That all being said, I'm pretty proud of the final product. I've never really coded anything multiplayer without some seriously easy libraries that do it for me, so it was cool to see how it's done!

#### Introduction:
This game is called "Cargo Cranes". It's a two-player WebXR board game where each player controls a crane and the objective is to load and unload cargo ships in a certain way. The game features two modes:

- **Competitive**: work against each other and see who can grab the most containers first
- **Collaborative**: work with each other and grab all of the containers in a short amount of time

#### Game Controls & Platforms:
##### __Controls__
- WASD or Arrow Keys to move Crane's Magnet around.
- Spacebar to pickup or putdown a container.
- Mouse clicks (or taps) required for menu events

##### __Platforms__
- Only tested on PC & Mac web browser (Chrome)
- Will likely function on mobile as well.
#### Gameplay Description:
Players operate cranes using simple keyboard controls and either compete to collect more containers than the other player or collaborate to get the best time in collaborative mode.
#### Video Demonstration:
 [Link](https://youtu.be/XarE2Gfpx0)

#### Challenges & Successes:
As mentioned in the above reflection, most of my issues to do with this project involved scope and estimating time to get things done. I did have a few additional specific issues that caused me trouble though.

1. At some point I managed to totally lock myself out of my project for a couple of days by committing a broken version and then spent a long time trying to figure out what was wrong and I still don't know. I managed to fix it by rolling back to an old version and then reprogramming what I had done but the thing is in the commit where the project was broken the only thing I changed was some integer values relating to speeds of animations and increments.
2. At one point I exceeded the stack calls by calling too many functions in succession... I didn't realize this was a problem and to be honest my project is a little bit haphazardly dependent (luckily that's ok in JS) and I could use a planning phase for the next one.
3. As can be seen in the commit history, I added physics to the project at the very beginning (aframe-physics-system), and wanted to use it to make the containers actually drop but way too late in the process realized that that was too complicated to implement for me multiplayer, so I ended up scrapping physics.

#### How to run:
1. Clone Repository
2. Install Node & npm
3. Run: ```npm install```
4. Run: ```node app.js```
5. Connect to http://localhost:8080

#### Sources:
I used models from SketchFab for this project. Credits follow.


##### Shipping containers
- source:	https://sketchfab.com/3d-models/shipping-containers-cc3f7136710f4905905eae1d10ac50b7
- author:	Mateusz Woliński (https://sketchfab.com/jeandiz)

##### Indoor Table Scene
* source:	https://sketchfab.com/3d-models/progetto-1-3b571cedfed544c8afa8d5a6a258cd69
* author:	c.capuano2020d (https://sketchfab.com/c.capuano2020d)

##### Cargo Ship
- source: https://sketchfab.com/3d-models/low-poly-cargo-ship-4c22cbaf01c1427f8ab60b3a07b1b32c
- author: Javier_Fernandez