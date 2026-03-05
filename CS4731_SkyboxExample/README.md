# CS 4731 Final Project
## "The Billionaire Holder"
Ethan Busa, Zack Robinson, Ellie Kim

#### A brief description of what you created
Our final project for CS 4731 is a guillotine with a reflective blade that animates on pressing "K" to come down on a 
refracting sphere textured with a head. Hierarchical spheres create a blood particle effect upon animation.
The blade then rises, returning to its original position. User input can change the lighting and camera angle of the scene.
#### A description of how each of the above topics are represented in your program
##### Core functionality:
Two 3D models that are more complex than a simple shape: guillotine blade, frame <br>
Two model transformations that animate: guillotine blade, the sphere falling to the ground after it comes down <br>
At least one point that illuminates using Phong shading: <br>
At least one spotlight with clearly visible boundaries: spotlight on the <br>
At least one textured object that also has a default texture: the sphere has an image texture but defaults to a simple red sphere <br>
At least one camera animation: arrow keys controlling movement <br>
At least one hierarchical model with at least two levels (parent, child, and grandchild): blood particle effects <br>
At least one clearly visible projection shadow cast by the point light. you can also opt to use a shadow buffer. <br>
At least one clearly visible reflection: guillotine blade <br>
At least one clearly visible refraction: sphere <br>
A textured skybox: bank painting texture <br>
Keyboard controls for the following:
- Toggle the animation on and off or, alternatively, control the motion of one or more objects in the scene with the keyboard: use the K key to trigger the blade and sphere animation 
- Toggle the shadows on and off: use the S key to toggle shadows
- Toggle the diffuse and specular components of the point light on and off (keeping ambient). When the point light is off, the shadows should disappear: use L key to toggle specular lighting, O key to toggle diffuse lighting
- Control the camera’s motion with the keyboard: use the arrow keys to move around the scene
##### Extra credit functionality:
Acceleration: the guillotine blade accelerates as it falls
#### Any additional instructions that might be needed to fully use your project (interaction controls, etc.)
Camera movement is controlled by the arrow keys. <br>
Press K to trigger the animation. <br>
Press L to toggle specular lighting and O to toggle diffuse lighting. <br>
Note that the model may not display correctly on Firefox, we recommend using Microsoft Edge or Opera.
#### What challenges you faced in completing the project.
##### Mapping a texture onto a sphere
##### Applying reflection to a moving object (blade)
#### What each group member was responsible for designing / developing.
3D model implementation: Ethan
3D animation: Ethan, Zack
2D texturing: Ellie
Acceleration: Zack
Bug fixing: Ethan, Zack, Ellie
Lighting: Zack
README: Ellie
Reflection: Ethan
Refraction: Ellie
Shadows:
#### External Sources
- Guillotine model is "Guillotine" by mfussi on [Thingiverse](https://www.thingiverse.com/thing:22951/files)
- Skybox texture is "Bank of America in Flames" by Alex Schaefer
- Sphere texture original is "Elon Musk" by Ricardo Galvão, modified by Ellie