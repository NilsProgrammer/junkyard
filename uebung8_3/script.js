class Button {
    //element: htmlElement<button>
    //isSelected: boolean = false
    //selectedTags: array<string>
    //deselectedTags: array<string>
	//group: array<Button>

    constructor(element, properties) {
        this.element = element;
        this.isSelected = false;
        this.group = [];
        this.selectedTags = ["selected-color"];
        this.deselectedTags = ["deselected-color"];

        if (properties) {
            Object.keys(properties).forEach((key) => {
                this[key] = properties[key];
            })
        }

        this.group.push(this);
        this.element.onclick = () => {
            this.select();
        }

        this.refresh();
    }

    _addClasses(classes) {
        classes.forEach((newClass) => {
            if (!this.element.classList.contains(newClass)) {
                this.element.classList.add(newClass);
            }
        });
    }

    _removeClasses(classes) {
        classes.forEach((newClass) => {
            if (this.element.classList.contains(newClass)) {
                this.element.classList.remove(newClass);
            }
        });
    }

    refresh() {
        if (this.isSelected) {
            this._removeClasses(this.deselectedTags);
            this._addClasses(this.selectedTags);
            this.onSelected();
            this.activated();
            return;
        }

        this._removeClasses(this.selectedTags);
        this._addClasses(this.deselectedTags);
        this.onDeselected();
    }

    select() {
        if (this.isSelected)
            return;

        this.group.forEach((button) => {
            button.deselect();
        })

        this.isSelected = true;
        this.refresh();
    }

    deselect() {
        if (!this.isSelected)
            return;

        this.isSelected = false;
        this.refresh();
    }

    toggle(state) {
        state = state === undefined ? !this.isSelected : state;

        if (state) {
            this.select();
            return;
        }

        this.deselect();
    }

    activated() {
        console.log("default activated")
    }

    onSelected() {

    }

    onDeselected() {

    }

    destroy() {
        this.element.remove();
    }
}

class ButtonNavigation {
    constructor(element) {
        this.element = element;
        this.buttons = [];
    }

    push(button) {
        this.element.appendChild(button.element);
        this.buttons.push(button);
        button.group = this.buttons;
    }

    clear() {
        this.buttons.forEach((button) => {
            button.destroy();
        })
    }
}

const app = {
    data: {
        currentView: {
            top: undefined,
            left: undefined
        },
        menuUrl: "https://raw.githubusercontent.com/NilsProgrammer/junkyard/main/main.json",
        menu: {},
    },

    components: [{
            name: "Promise",
            path: ""
        },
        {
            name: "async",
            path: ""
        },
        {
            name: "fetch",
            path: ""
        },
        {
            name: "callback",
            path: ""
        },
        {
            name: "class",
            path: ""
        },
    ],

    created: function() {
        fetch(this.data.menuUrl)
			.then((response) => response.json())
			.then((json) => {
				this.data.menu = json;
                this.methods.fillTopNav(json);
			})
            .catch((error) => {
                console.log(error.message);
            });
    },

    methods: {
        fillTopNav: function(data) {
            const topbar = document.getElementById("topbar");
            const topbarObj = new ButtonNavigation(topbar);

            Object.keys(data).forEach((key) => {
                const topnavButton = document.createElement("button");
                topnavButton.innerHTML = key;
                topnavButton.classList.add("button", "horizontal-spacing");

                const topnavButtonObj = new Button(topnavButton);

                topnavButtonObj.activated = () => {
                    if (app.data.currentView.top == key)
                        return;

                    app.methods.fillLeftNav(key, app.data.menu[key]);
                }

                topbarObj.push(topnavButtonObj);
            })

            topbarObj.buttons[0].select();
        },
        fillLeftNav: function(mode, data) {
            if (data == undefined)
                return;

            const leftbar = document.getElementById("left");
            leftbar.innerHTML = "";
            const leftbarObj = new ButtonNavigation(leftbar);

            Object.keys(data).forEach((key) => {
                const navButton = document.createElement("button");
                navButton.innerHTML = key;
                navButton.classList.add("button", "vertical-spacing");

                const navButtonObj = new Button(navButton);

                navButtonObj.activated = () => {
                    if (app.data.currentView.left == key) {
                        return;
                    }

                    app.methods.fillBody(data[key].content);
                    app.methods.fillRight(data[key].references);
                }

                leftbarObj.push(navButtonObj);
            })

            leftbarObj.buttons[0].select();
        },

        fillBody: function(body) {
            const element = document.getElementById("bodycontent");
			element.innerHTML = body;

        },

        fillRight: function(references) {
			const list = document.getElementById("right");
			list.innerHTML = "";
            references.forEach((reference) => {
				const element = document.createElement("a");
				element.href = reference;
                element.innerHTML = "Reference";
                element.classList.add("link", "text");
				list.appendChild(element);
            })
        },
        selectView: function(index) {
            const self = app; //annoying that this changes, thank god i can set self to app, imagine this problem with vue
            const oldIndex = self.data.currentView;
            if (index == oldIndex) {
                return;
            }

            self.data.currentView = index;

            const viewData = self.components[index];
        },
    },
}

app.created();
