<div align="center">
  <h1>DraggableWindows.js</h1>
</div>

  ![DraggableWindows v1.0.0](https://github.com/ctrachte/DraggableWindows/blob/6e93bbdc40c1453f34c06c2ee8864c3ce49183ca/2022-06-08%2018-33-46.gif)

<p align="left">
  Ever wanted to replicate the windows UI within the browser using JS and HTML? 
  Now you can! Draggable windows lets you silo large enterprise applications into digestable apps, and run each app side by side.
  Perfect for microservices, multi-tasking, role-based productivity software, and data-driven application management.
</p>

## Features
  - Grid for windows to snap to, for multi-tasking. 
  - Hydrate with any content from any source!
  - Customizeable color schemes *coming soon!*
  - lightweight, easy to setup, no frameworks or special syntax.
  - Works great with bootstrap! 
  - Can be configured to be fully responsive!

  *Detailed documentation coming soon!*

## Quick start

 - Download the project and open `index.html` in your browser
 - Add or remove options and elements from the options object. 

### How To: Create the body content of your window:
 There are lots of ways to add content to a window. You can create JS classes that contain or return functional pieces of HTML content, use a templating engine, or front-end frame-work like React to generate content.

 After content is rendered to the DOM, you simply add a reference to the parent element in the window options. Example: `{body: yourContentElement}`.

  *Detailed documentation coming soon!*

 ##### Here's an example of a simple Bootstrap form, and a small piece of code to hook the button into: 
  ```
  <form>
    <div class="form-group">
      <label for="exampleInputEmail1">Email address</label>
      <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email">
      <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
    </div>
    <div class="form-group">
      <label for="exampleInputPassword1">Password</label>
      <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password">
    </div>
    <div class="form-check">
      <input type="checkbox" class="form-check-input" id="exampleCheck1">
      <label class="form-check-label" for="exampleCheck1">Check me out</label>
    </div>
    <button type="submit" class="submitButton btn btn-primary">Submit</button>
  </form>
  <script> 
  // add code to the form element:
    let button = document.querySelector('submitButton');
    button.onclick = (e) => alert('Submitted form!');
  </script>
 ```
  Use code in your index, home page, or component to trigger the opening of a new window, then supply a reference to this `<form>` element to the DraggableWindow options. 
  *Voila!* The form lives in a Draggable Window! *See `index.html` for more detailed example.*

## API/Route Table

### Options:
 - `container` - DOM Node that will contain the DraggableWindows UI.
 - `header` - DOM Node or String text that represents the header content of the Draggable Window. 
 - `body` - DOM Node or String text that represents the content of your window. Can be a string template literal or a pre-rendered HTML document.
 - `footer` - DOM Node or String text that represents the footer content of the Draggable Window.
 - `initialPosition` - Array with 2 values: `[x, y]`, valid values are as follows:
   - x values: `left`, `right`, `middle`
   - y values: `top`, `bottom`, `middle`
   - `[middle, middle]` will position the Draggable Window full-screen, centered.
 - `left` - the distance from the right of the screen that the window will appear, example: `43px`
 - `top` - the distance from the top of the screen that the window will appear, example: `48px`
 - `offsetTop` - the margin that will appear above the Draggable Window grid, windows will not occupy this space. Used for application header content, etc.
 - `offsetLeft` - the margin that will appear to the left of the Draggable Window grid, windows will not occupy this space. Used for application side menu content, etc.
 - `draggable` - boolean, will determine whether or not the user can drag the Draggable Window around.
 - `close` - boolean, will determine whether or not the user can close the window, and if the 'close' icon shows at the top right of the header.
 - `locked` - boolean, will determine whether or not the window *must* be snapped to a grid space, if false, window can exist free form, or snapped to grid.
 - `snapping` - boolean, will determine whether or not the grid will exist for the Draggable Window to snap to. 
 - `

## Contributing [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/inessadl/readme/issues)

[Please visit this contribution guide for GitHub open source if you are unsure about any of these steps:](https://gist.github.com/Chaser324/ce0505fbed06b947d962)

1. Fork the Project (top right there should be a button)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 

*Code will be reviewed before being merged. If your code does not quite work or needs revision it may not be merged to the master.*

<!-- LICENSE -->
## License

Distributed under the MIT License. 

