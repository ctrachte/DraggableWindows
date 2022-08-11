// An individual Window
class DraggableWindow
{
    constructor(options)
    {
        this.options = options; // options object must be defined
        if (!options)
        {
            throw ("DraggableWindow options must be defined!")
        }
        if (typeof options.container === "undefined" || !options.container)
        {
            throw ("DraggableWindow container element must be defined. Add one to your index and pass in as an option.")
        }
        this.hasManager = options.hasManager // READOONLY - will only be true if GlobalWindowManager created this window. READONLY
        this.offsetLeft = options.offsetLeft || document.getElementById('sidebar').getBoundingClientRect().width; //set this for a left toolbar width
        this.offsetTop = options.offsetTop || document.getElementById('headnav').getBoundingClientRect().height; // set this for a top toolbar width
        this.halfsetTop = this.offsetTop / 2; //for calculations only
        this.halfsetLeft = this.offsetLeft / 2; //for calculations only
        this.height = (options.height === null || typeof options.height === "undefined") ? window.innerHeight - this.offsetTop + "px" : options.height; // set height of window on creation
        this.width = (options.width === null || typeof options.width === "undefined") ? window.innerWidth - this.offsetLeft + "px" : options.width; // set width of window on creation
        this.left = (options.left === null || typeof options.left === "undefined") ? this.offsetLeft + "px" : options.left; // set left position of window on creation
        this.top = (options.top === null || typeof options.top === "undefined") ? this.offsetTop + "px" : options.top; // set top position of window on creation
        this.zIndex = this.options.zIndex ? this.options.zIndex : 10; // default z index
        this.id = this.options.id || `newWindow-${Date.now()}`; // unique id for the window
        this.resizeable = options.resizeable; // enables resizing of window
        this.onClose = options.onClose || function () { }; // fires when a window is closed
        this.onMaximize = options.onMaximize || function () { }; // fires when window is made full screen
        this.onMinimize = options.onMinimize || function () { }; // fires when window is minimized to tray
        this.onOpen = options.onOpen || function () { }; //fires when window is openend
        // elements
        this.container = this.options.container;// container
        this.window = document.createElement('div'); // window base element
        this.window.setAttribute('id', this.id); // set unique id for the window
        this.header = this.options.header; // header content
        this.footer = this.options.footer; // footer content
        this.body = this.options.body; // body content
        this.showScrollButton = this.showScrollButton.bind(this);
        this.locked = (options.locked !== null && typeof options.locked !== "undefined") ? options.locked : true; // windows will be locked to grid sizes by default
        this.snapping = (options.snapping === null || typeof options.snapping === "undefined") ? options.locked : options.snapping;  // turn this on/off for snapping to grid
        this.draggable = (options.draggable !== null && typeof options.draggable !== "undefined") ? options.draggable : true; // windows will be locked in place/position if false, eg. NOT draggable.
        if (this.locked) this.resizeable = false;
        if (this.locked) this.snapping = true;
        this.title = (typeof options.title === "undefined" || options.title === null) ? this.id : options.title;// title of window, defaults to id
        this.close = (typeof options.close === "undefined" || options.close === null) ? true : options.close;
        this.minimize = (typeof options.minimize === "undefined" || options.minimize === null) ? this.close : options.minimize;
        this.maximize = (typeof options.maximize === "undefined" || options.maximize === null) ? this.close : options.maximize;
        let calloutContainer = this.window;
        if (typeof this.options.callouts === "boolean" && this.options.callouts !== false)
        {
            this.callouts = new clsCalloutMsg({ containerElement: calloutContainer });
            this.callouts.containerElement.querySelector('.calloutMsgs').classList.add("pt-4", "text-center");
            this.callouts.containerElement.querySelector('.calloutMsgs').style.color = "white";
            this.callouts.containerElement.querySelector('.calloutMsgs').style.position = "absolute";
            this.callouts.containerElement.querySelector('.calloutMsgs').style.height = "75px";
            this.callouts.containerElement.querySelector('.calloutMsgs').style.width = "100%";
        } else
        {
            this.callouts = function () {console.error('Callouts have been disabled via window options.')}
        }
        //initial element creation methods:
        if (typeof this.header === "string")
        {
            let headerText = this.header;
            this.header = document.createElement('div');
            this.header.setAttribute('id', `${this.id}-header`);
            this.header.innerHTML = headerText;
        } else if (typeof this.header === "undefined")
        {
            console.warn('No Header Defined, your window will have a blank header.');
            this.header = document.createElement('div');
            this.header.setAttribute('id', `${this.id}-header`);
            this.header.innerHTML = this.title;
        } else if (this.header === false)
        {
            this.header = document.createElement('div');
            this.header.setAttribute('id', `${this.id}-header`);
            this.header.innerHTML = "";
        } else
        {
            let headerEl = this.header;
            this.header = document.createElement('div');
            this.header.setAttribute('id', `${this.id}-header`);
            this.header.appendChild(headerEl);
        }
        if (typeof options.body === "undefined" || options.body === null || !options.body)
        {
            console.warn('No body element specified. Your content will show as empty')
            this.body = document.createElement('div');
            this.body.setAttribute('id', `${this.id}-body`);
            this.body.innerHTML = "";
        } else
        {
            if (typeof this.body === "string")
            {
                let bodyText = this.body;
                this.body = document.createElement('div');
                this.body.setAttribute('id', `${this.id}-body`);
                this.body.innerHTML = bodyText;
            } else
            {
                let bodyElement = this.body;
                this.body = document.createElement('div');
                this.body.setAttribute('id', `${this.id}-body`);
                this.body.appendChild(bodyElement);
            }
        }
        if (typeof options.footer !== "undefined" && options.footer !== null && options.footer)
        {
            if (typeof this.footer === "string")
            {
                let footerText = this.footer;
                this.footer = document.createElement('div');
                this.footer.setAttribute('id', `${this.id}-footer`);
                this.footer.innerHTML = footerText;
            } else
            {
                let footerEl = this.footer;
                this.footer = document.createElement('div');
                this.footer.setAttribute('id', `${this.id}-footer`);
                this.footer.appendChild(footerEl);
            }
        }
        if (this.close)
        {
            this.closeButton = document.createElement('span');
            this.closeButton.style.position = "absolute";
            this.closeButton.style.right = "3px";
            this.closeButton.innerHTML = `
                <b type="button" class="pull-right closeWindowButton" aria-label="Close">✖</b>
            `;
            if (!this.hasManager)
            {
                this.closeButton.onclick = (e) =>
                {
                    this.window.remove();
                    this.onClose();
                }
            }
            this.header.appendChild(this.closeButton);
        }
        if (this.maximize && this.hasManager)
        {
            this.maximizeButton = document.createElement('span');
            this.maximizeButton.innerHTML = `
                <i type="button" class="fs-6 mt-1 me-1 pfi-maximize fa-solid pull-right maximizeWindowButton" aria-label="Maximize"></i>
            `;
            this.header.appendChild(this.maximizeButton);
        }
        if (this.minimize && this.hasManager)
        {
            this.minimizeButton = document.createElement('span');
            this.minimizeButton.innerHTML = `
                <i type="button" class="fs-5 mt-1 me-1 pfi-minimize fa-solid pull-right minimizeWindowButton" aria-label="Minimize"></i>
            `;
            this.header.appendChild(this.minimizeButton);
        }
        this.container.appendChild(this.window);
        this.draggableContent = this.container.querySelector('#' + this.id);
        this.draggableContent.style = `
            position: fixed;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            z-index: ${this.zIndex};
            color:black;
            background-color: #FFF;
            width: ${!this.resizeable ? this.width : this.width ? this.width : "auto"};
            height: ${!this.resizeable ? this.height : this.height ? this.height : "auto"};
            left: ${this.left || "33%"};
            top: ${this.top || "33%"};
            min-height: 30px;
            min-width: 30px;
            resize: ${this.resizeable ? "both" : ""};
            overflow: auto;
            border: 1px solid #d3d3d3;
        `;
        if (this.header !== false)
        {
            this.header.style = `
            cursor: move;
            z-index: ${this.zIndex + 20};
            background-color: #FFD530;
            color: black;
            position:fixed;
            text-align: center;
            width: ${this.draggableContent.getBoundingClientRect().width}px;
            left: ${this.left || "33%"};
            top: ${this.top || "33%"};
            `;
            this.draggableContent.style.paddingTop = this.header.getBoundingClientRect().height + "px";
            this.draggableContent.appendChild(this.header);
        }
        // scroll buttons
        this.scrollButton = document.createElement('span');
        this.scrollButton.innerHTML = `<button class="fa fa-arrow-down btn btn-gold py-3 text-bold" id="scrollButton-${this.id}" title="go to bottom or bottom of window"></button>`;
        this.scrollButton = this.scrollButton.firstChild;
        this.scrollButton.onclick = function ()
        {
            if (this.scrollButton.classList.contains('fa-arrow-down'))
            {
                this.draggableContent.scrollTop = this.draggableContent.scrollHeight;
            } else
            {
                this.draggableContent.scrollTop = 0;
            }
        }.bind(this);
        this.scrollButtons = document.createElement('div');
        this.scrollButtons.appendChild(this.scrollButton)
        this.header.appendChild(this.scrollButtons);
        this.scrollButtons.style = `
            position: absolute;
            top:0px;
            left: 0px;
            z-index: 99999;
            cursor: pointer;
        `;
        //footer styles
        if (options.footer)
        {
            this.footer.style = `
            cursor: move;
            z-index: ${this.zIndex + 2};
            background-color: #EEE;
            color: black;
          `;
            this.draggableContent.appendChild(this.footer);
        }
        this.body.style = `
            z-index:${this.zIndex};
            height:${!options.header && !options.footer ? "100%" : "80%"};
            background-color: #fff;
          `;
        this.draggableContent.appendChild(this.body);
        this.container.appendChild(this.draggableContent);
        this.dragElement = this.dragElement.bind(this);
        this.checkPos = this.checkPos.bind(this);
        this.hideShadows = this.hideShadows.bind(this);
        this.showShadow = this.showShadow.bind(this);
        this.createShadows = this.createShadows.bind(this);
        //init logic
        if (this.snapping)
        {
            this.createShadows();
            this.hideShadows();
        }
        this.dragElement();
        this.timemoutHide;
        this.scrollPosY = this.draggableContent.scrollTop;
        this.draggableContent.addEventListener('scroll', function ()
        {
            this.showScrollButton();
        }.bind(this));
        if (typeof this.options.initialPosition === "object" && this.options.initialPosition.length)
        {
            this.snapTo(this.draggableContent, this.options.initialPosition[0], this.options.initialPosition[1])
        }

    }
    createShadows()
    {
        if (this.shadows) {
            this.shadows.topRightShadow.remove();
            this.shadows.bottomRightShadow.remove();
            this.shadows.topLeftShadow.remove();
            this.shadows.bottomleftShadow.remove();
            this.shadows.topShadow.remove();
            this.shadows.bottomShadow.remove();
            this.shadows.leftShadow.remove();
            this.shadows.rightShadow.remove();
            this.shadows.maxShadow.remove();
        }
        this.shadows = {
            topRightShadow: this.container.appendChild(document.createElement('div')),
            bottomRightShadow: this.container.appendChild(document.createElement('div')),
            topLeftShadow: this.container.appendChild(document.createElement('div')),
            bottomleftShadow: this.container.appendChild(document.createElement('div')),
            topShadow: this.container.appendChild(document.createElement('div')),
            bottomShadow: this.container.appendChild(document.createElement('div')),
            leftShadow: this.container.appendChild(document.createElement('div')),
            rightShadow: this.container.appendChild(document.createElement('div')),
            maxShadow: this.container.appendChild(document.createElement('div'))
        };
        this.shadowStyle = this.options.shadowStyle || `
                position: absolute;
                display: none;
                height: ${(window.innerHeight * .5) - this.halfsetTop}px;
                width: ${(window.innerWidth * .5) - this.halfsetLeft}px;
                z-index: 999;
                background-color: rgba(0,0,0, 0.3);
                border: dashed 2px gold;
            `;
        this.shadows.topLeftShadow.style = this.shadowStyle;
        this.shadows.topLeftShadow.style.top = this.offsetTop + "px";
        this.shadows.topLeftShadow.style.left = this.offsetLeft + "px";

        this.shadows.bottomleftShadow.style = this.shadowStyle;
        this.shadows.bottomleftShadow.style.bottom = "0px";
        this.shadows.bottomleftShadow.style.left = this.offsetLeft + "px";

        this.shadows.topRightShadow.style = this.shadowStyle;
        this.shadows.topRightShadow.style.top = this.offsetTop + "px";
        this.shadows.topRightShadow.style.right = "0px";

        this.shadows.bottomRightShadow.style = this.shadowStyle;
        this.shadows.bottomRightShadow.style.bottom = "0px";
        this.shadows.bottomRightShadow.style.right = "0px";

        this.shadows.topShadow.style = this.shadowStyle;
        this.shadows.topShadow.style.top = this.offsetTop + "px";
        this.shadows.topShadow.style.left = this.offsetLeft + "px";
        this.shadows.topShadow.style.width = (window.innerWidth) - this.offsetLeft + "px";

        this.shadows.bottomShadow.style = this.shadowStyle;
        this.shadows.bottomShadow.style.bottom = "0px";
        this.shadows.bottomShadow.style.left = this.offsetLeft + "px";
        this.shadows.bottomShadow.style.width = (window.innerWidth) - this.offsetLeft + "px";

        this.shadows.rightShadow.style = this.shadowStyle;
        this.shadows.rightShadow.style.top = this.offsetTop + "px";
        this.shadows.rightShadow.style.right = "0px";
        this.shadows.rightShadow.style.height = `${(window.innerHeight) - this.offsetTop}px`;

        this.shadows.leftShadow.style = this.shadowStyle;
        this.shadows.leftShadow.style.top = this.offsetTop + "px";
        this.shadows.leftShadow.style.left = this.offsetLeft + "px";
        this.shadows.leftShadow.style.height = `${(window.innerHeight) - this.offsetTop}px`;

        this.shadows.maxShadow.style = this.shadowStyle;
        this.shadows.maxShadow.style.top = this.offsetTop + "px";
        this.shadows.maxShadow.style.left = this.offsetLeft + "px";
        this.shadows.maxShadow.style.height = `${(window.innerHeight) - this.offsetTop}px`;
        this.shadows.maxShadow.style.width = (window.innerWidth) - this.offsetLeft + "px";
    }
    dragElement(el)
    {
        let context = this;
        window.addEventListener("resize", function () {
            context.checkSize();
            context.createShadows();
        });

        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (!this.draggable) return;
        context.checkSize();
        if (!el)
        {
            el = this.draggableContent;
            if (context.header)
            {
                context.header.onmousedown = dragMouseDown;
                context.header.ontouchmove = dragMouseDown;
                if (context.isMobile) context.header.addEventListener('touchmove', dragMouseDown, { passive: false });
            }
            if (context.footer)
            {
                context.footer.onmousedown = dragMouseDown;
                context.footer.ontouchmove = dragMouseDown;
                if (context.isMobile) context.header.addEventListener('touchmove', dragMouseDown, { passive: false });
            }
            if (!context.footer && !context.header)
            {
                el.onmousedown = dragMouseDown;
                el.ontouchmove = dragMouseDown;
                if (context.isMobile) el.addEventListener('touchmove', dragMouseDown, { passive: false });
            }
        }
        function dragMouseDown(e)
        {
            e = e || window.event;
            context.checkSize();
            e.preventDefault();
            if (e.target.id === context.id + "-footer")
            {
                if (isMobile)
                {
                    e.clientX = e.touches[0].clientX;
                    e.clientY = e.touches[0].clientY
                }
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                if (context.snapping)
                {
                    el.style.top = e.clientY - 360 + "px";
                    el.style.left = e.clientX - 180 + "px";

                }
                if (context.isMobile)
                {
                    context.footer.addEventListener('touchend', closeDragElement, { passive: false });
                    context.footer.addEventListener('touchmove', elementDrag, { passive: false });
                } else
                {
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                }
            } else if (e.target.id === context.id + "-header")
            {
                if (context.isMobile)
                {
                    e.clientX = e.touches[0].clientX;
                    e.clientY = e.touches[0].clientY
                }
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                if (context.snapping)
                {
                    el.style.top = e.clientY + "px";
                    el.style.left = e.clientX - 180 + "px";
                }
                if (context.isMobile)
                {
                    context.header.addEventListener('touchend', closeDragElement, { passive: false });
                    context.header.addEventListener('touchmove', elementDrag, { passive: false });
                } else
                {
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                }
            }
        }

        function elementDrag(e)
        {
            e = e || window.event;
            e.preventDefault();
            if (e.touches)
            {
                e.clientX = e.touches[0].clientX;
                e.clientY = e.touches[0].clientY
            }
            if (context.snapping)
            {
                el.style.width = "360px";
                el.style.height = "360px";
                context.header.style.width = el.style.width;
            }
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            el.style.top = (el.offsetTop - pos2) + "px";
            el.style.left = (el.offsetLeft - pos1) + "px";
            context.header.style.left = (el.offsetLeft - pos1) + "px";
            context.header.style.top = (el.offsetTop - pos2) + "px";
            if (context.snapping)
            {
                //console.table(el.getBoundingClientRect().width, el.getBoundingClientRect().height , el.offsetLeft, el.offsetTop, pos1, pos2, pos3, pos4)
                context.orientation = context.checkPos((el.offsetLeft - pos1) + (.5 * el.getBoundingClientRect().width), (el.offsetTop - pos2) + (.5 * el.getBoundingClientRect().height));
                context.showShadow(context.orientation[0], context.orientation[1]);
            }
        }

        function closeDragElement()
        {
            context.orientation = context.checkPos((el.offsetLeft - pos1) + (.5 * el.getBoundingClientRect().width), (el.offsetTop - pos2) + (.5 * el.getBoundingClientRect().height));
            if (context.snapping)
            {
                context.snapTo(context.draggableContent, context.orientation[0], context.orientation[1]);
                context.header.style.width = el.style.width;
                context.header.style.left = el.style.left;
                context.header.style.top = el.style.top;
                context.hideShadows();
            }
            /* stop moving when mouse button is released:*/
            document.onmouseup = null;
            document.onmousemove = null;
            if (context.isMobile)
            {
                if (context.header) context.header.ontouchmove = null;
                if (context.footer) context.footer.ontouchmove = null;
                if (el) el.ontouchmove = null;
            }
        }
    }
    snapTo(el, x, y)
    {
        if (this.isMobile)
        {
            if (window.innerHeight > window.innerWidth)
            {
                if (x === 'middle' && y === 'top')
                {
                    el.style.bottom = "";
                    el.style.top = this.offsetTop + "px"
                    el.style.left = this.offsetLeft + "px";
                    el.style.right = "";
                    el.style.height = parseFloat(window.innerHeight * .5) - this.halfsetTop + "px";
                    el.style.width = parseFloat(window.innerWidth) - this.offsetLeft + "px";
                } else if (x === 'middle' && y === 'bottom')
                {
                    el.style.bottom = "0px";
                    el.style.top = "";
                    el.style.left = this.offsetLeft + "px";
                    el.style.right = "";
                    el.style.height = parseFloat(window.innerHeight * .5) - this.halfsetTop + "px";
                    el.style.width = parseFloat(window.innerWidth) - this.offsetLeft + "px";
                }
            } else
            {
                if (x === 'right' && y === 'middle')
                {
                    el.style.left = "";
                    el.style.right = "0px";
                    el.style.bottom = "";
                    el.style.top = this.offsetTop + "px"
                    el.style.height = parseFloat(window.innerHeight) - this.offsetTop + "px";
                    el.style.width = parseFloat(window.innerWidth * .5) - this.halfsetLeft + "px";
                } else if (x === 'left' && y === 'middle')
                {
                    el.style.left = this.offsetLeft + "px";
                    el.style.right = "";
                    el.style.bottom = "";
                    el.style.top = this.offsetTop + "px"
                    el.style.height = parseFloat(window.innerHeight) - this.offsetTop + "px";
                    el.style.width = parseFloat(window.innerWidth * .5) - this.halfsetLeft + "px";
                } else
                {
                    el.style.left = this.offsetLeft + "px";
                    el.style.right = "";
                    el.style.bottom = "";
                    el.style.top = this.offsetTop + "px"
                    el.style.height = parseFloat(window.innerHeight) - this.offsetTop + "px";
                    el.style.width = parseFloat(window.innerWidth) - this.offsetLeft + "px";
                }
            }
            this.header.style.width = el.style.width;
            this.header.style.left = el.style.left;
            this.header.style.top = el.style.top;
            return;
        }
        if (x !== 'middle' && y !== 'middle')
        {
            if (y === 'top')
            {
                el.style.top = this.offsetTop + "px"
                el.style.bottom = "";
                el.style.height = (window.innerHeight * .5) - this.halfsetTop + "px";
                el.style.width = (window.innerWidth * .5) - this.halfsetLeft + "px";
            } else if (y === 'bottom')
            {
                el.style.bottom = "0px";
                el.style.top = "";
                el.style.height = (window.innerHeight * .5) - this.halfsetTop + "px";
                el.style.width = (window.innerWidth * .5) - this.halfsetLeft + "px";
            }
            if (x === 'left')
            {
                el.style.left = this.offsetLeft + "px";
                el.style.right = "";
                el.style.height = (window.innerHeight * .5) - this.halfsetTop + "px";
                el.style.width = (window.innerWidth * .5) - this.halfsetLeft + "px";
            } else if (x === 'right')
            {
                el.style.left = "";
                el.style.right = "0px";
                el.style.height = (window.innerHeight * .5) - this.halfsetTop + "px";
                el.style.width = (window.innerWidth * .5) - this.halfsetLeft + "px";
            }
        } else if (x === 'middle' && y === 'top')
        {
            el.style.bottom = "";
            el.style.top = this.offsetTop + "px"
            el.style.left = this.offsetLeft + "px";
            el.style.right = "";
            el.style.height = parseFloat(window.innerHeight * .5) - this.halfsetTop + "px";
            el.style.width = parseFloat(window.innerWidth) - this.offsetLeft + "px";
        } else if (x === 'middle' && y === 'bottom')
        {
            el.style.bottom = "0px";
            el.style.top = "";
            el.style.left = this.offsetLeft + "px";
            el.style.right = "";
            el.style.height = parseFloat(window.innerHeight * .5) - this.halfsetTop + "px";
            el.style.width = parseFloat(window.innerWidth) - this.offsetLeft + "px";
        } else if (x === 'right' && y === 'middle')
        {
            el.style.left = "";
            el.style.right = "0px";
            el.style.bottom = "";
            el.style.top = this.offsetTop + "px"
            el.style.height = parseFloat(window.innerHeight) - this.offsetTop + "px";
            el.style.width = parseFloat(window.innerWidth * .5) - this.halfsetLeft + "px";
        } else if (x === 'left' && y === 'middle')
        {
            el.style.left = this.offsetLeft + "px";
            el.style.right = "";
            el.style.bottom = "";
            el.style.top = this.offsetTop + "px"
            el.style.height = parseFloat(window.innerHeight) - this.offsetTop + "px";
            el.style.width = parseFloat(window.innerWidth * .5) - this.halfsetLeft + "px";
        } else
        {
            if (this.locked)
            {
                el.style.left = this.offsetLeft + "px";
                el.style.right = "";
                el.style.bottom = "";
                el.style.top = this.offsetTop + "px"
                el.style.height = parseFloat(window.innerHeight) - this.offsetTop + "px";
                el.style.width = parseFloat(window.innerWidth) - this.offsetLeft + "px";
            } else
            {
                el.style.height = this.height;
                el.style.width = this.width;
            }
        }
        this.header.style.width = el.style.width;
        this.header.style.left = el.style.left;
        this.header.style.top = el.style.top;
    }
    showShadow(x, y)
    {
        // TODO: need to measure from middle of draggable, not cursor pos
        if (this.isMobile)
        {
            if (window.innerHeight > window.innerWidth)
            {
                if (y === 'bottom' && x === 'middle')
                {
                    this.hideShadows();
                    this.shadows.bottomShadow.style.display = 'block';
                } else if (y === 'top' && x === 'middle')
                {
                    this.hideShadows();
                    this.shadows.topShadow.style.display = 'block';
                } else
                {
                    this.hideShadows();
                }
            } else
            {
                if (y === 'middle' && x === 'right')
                {
                    this.hideShadows();
                    this.shadows.rightShadow.style.display = 'block';
                } else if (y === 'middle' && x === 'left')
                {
                    this.hideShadows();
                    this.shadows.leftShadow.style.display = 'block';
                } else
                {
                    this.hideShadows();
                }
            }
            return
        }
        if (y === 'top' && x === 'left')
        {
            this.hideShadows();
            this.shadows.topLeftShadow.style.display = 'block';
        } else if (y === 'top' && x === 'right')
        {
            this.hideShadows();
            this.shadows.topRightShadow.style.display = 'block';
        } else if (y === 'bottom' && x === 'left')
        {
            this.hideShadows();
            this.shadows.bottomleftShadow.style.display = 'block';
        } else if (y === 'bottom' && x === 'right')
        {
            this.hideShadows();
            this.shadows.bottomRightShadow.style.display = 'block';
        } else if (y === 'bottom' && x === 'middle')
        {
            this.hideShadows();
            this.shadows.bottomShadow.style.display = 'block';
        } else if (y === 'top' && x === 'middle')
        {
            this.hideShadows();
            this.shadows.topShadow.style.display = 'block';
        } else if (y === 'middle' && x === 'right')
        {
            this.hideShadows();
            this.shadows.rightShadow.style.display = 'block';
        } else if (y === 'middle' && x === 'left')
        {
            this.hideShadows();
            this.shadows.leftShadow.style.display = 'block';
        } else
        {
            this.hideShadows();
            if (this.locked) this.shadows.maxShadow.style.display = 'block';
        }
    }
    hideShadows()
    {
        this.shadows.topLeftShadow.style.display = 'none';
        this.shadows.topRightShadow.style.display = 'none';
        this.shadows.bottomleftShadow.style.display = 'none';
        this.shadows.bottomRightShadow.style.display = 'none';
        this.shadows.topShadow.style.display = 'none';
        this.shadows.bottomShadow.style.display = 'none';
        this.shadows.rightShadow.style.display = 'none';
        this.shadows.leftShadow.style.display = 'none';
        this.shadows.maxShadow.style.display = 'none';
    }
    checkPos(x, y)
    {
        let screenBottom = parseFloat(window.innerHeight);
        let screenRight = parseFloat(window.innerWidth);
        return [x >= (screenRight * .667) ? "right" : (x <= (screenRight * .333) ? "left" : "middle"), y >= (screenBottom * .667) ? "bottom" : (y <= (screenBottom * .333) ? "top" : "middle")];
    }
    checkSize()
    {
        this.isMobile = (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i));
    }
    scrollbarVisible(element)
    {
        return element.scrollHeight > element.clientHeight;
    }
    showScrollButton()
    {
        if (this.scrollbarVisible(this.draggableContent))
        {
            if (this.draggableContent.scrollTop > this.scrollPosY)
            {
                this.scrollButton.classList.add('fa-arrow-down')
                this.scrollButton.classList.remove('fa-arrow-up')
                this.scrollButton.style.display = "block";
            } else if (this.draggableContent.scrollTop < this.scrollPosY)
            {
                this.scrollButton.classList.add('fa-arrow-up')
                this.scrollButton.classList.remove('fa-arrow-down')
                this.scrollButton.style.display = "block";
            }
        } else
        {
            this.scrollButton.style.display = "none";
        }
        window.clearTimeout(this.timemoutHide);
        this.scrollPosY = this.draggableContent.scrollTop;
        this.timemoutHide = setTimeout(function ()
        {
            this.scrollButton.style.display = "none";
        }.bind(this), 3000);
        this.timemoutHide;
    }
}