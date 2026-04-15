let homeRect;
const iconSize = 68;

let iconsPerCol;

let row = 0;
let col = 0;

let activeWindows = [];
let files = [];
let activeFolder = null;

function init() {
    homeRect = document.querySelector(".home").getBoundingClientRect();
    iconsPerCol = Math.floor(homeRect.height / iconSize);

    //for arranged so it will arrange in grid fills col first
    document.querySelectorAll('.homeIcons').forEach((element) => {

        const rect = element.getBoundingClientRect();
        element.style.position = 'absolute';
        element.style.left = (col * iconSize) + 'px';
        element.style.top = (row * iconSize) + 'px';

        row++;
        if (row >= iconsPerCol) {
            row = 0;
            col++;
        }

        const beforeElement = document.createElement('div');
        beforeElement.style.width = rect.width + 'px';
        beforeElement.style.height = rect.height + 'px';
        beforeElement.style.visibility = 'hidden';

        element.parentNode.insertBefore(beforeElement, element);

        const fileId = element.id.replace("-icon","");
        const label = element.querySelector("#label").textContent;
        const imgSrc = element.querySelector("img").src;

        files.push({ id: fileId, label: label, iconSrc: imgSrc });

        element.addEventListener('click', (event) => {
            event.stopPropagation();
            document.querySelectorAll('.homeIcons').forEach((element) => {
                element.style.filter = '';
            })
            element.style.filter = 'invert(1)';
        })
        dragElement(element);
    });

    //for the fee of clicking the icons so color changes the points out that i clicked
    document.body.addEventListener('click', (e) => {
        if(!e.target.closest('.homeIcons')){
            document.querySelectorAll('.homeIcons').forEach((element) =>{
                element.style.filter = '';
            })
        }
    });


    document.querySelectorAll(".window").forEach(win=>{

        win.style.visibility = "hidden";
        win.style.setProperty('display', 'block', 'important');

        win.style.top = (window.innerHeight / 2) - (win.offsetHeight / 2) + 'px';
        win.style.left = (window.innerWidth / 2) - (win.offsetWidth / 2) + 'px';

        win.style.visibility = "";
        win.style.setProperty('display', 'block', 'important');
        dragElementWindow(win);
    });

    //to make click move the window top above all other window
    document.querySelectorAll(".window").forEach(win => {
        win.addEventListener("click", (e) => {
            if(win.style.display!== 'none'){
                bringWindowToTop(win.id);
            }
        })
    })

    //to resize the window to either full or the default one
    document.querySelectorAll(".resize").forEach(btn =>{
        btn.addEventListener("click", (e) =>{
            const win = e.target.closest(".window");

            if(win.dataset.full === "true"){
                win.style.width = win.dataset.width;
                win.style.height = win.dataset.height;
                win.style.top = win.dataset.top;
                win.style.left = win.dataset.left;

                win.dataset.full = "false";

                win.style.margin = '0';
            } else {
                win.dataset.width = win.style.width;
                win.dataset.height = win.style.height;
                win.dataset.top = win.style.top;
                win.dataset.left = win.style.left;

                win.style.width = homeRect.width + 'px';
                win.style.height = homeRect.height + 'px';
                win.style.top = homeRect.top + 'px';
                win.style.left = homeRect.left + 'px';

                win.dataset.full = "true";

                win.style.margin = '0';
            }
        });
    });

        // to make all close buttons works to close the wiondow
        document.querySelectorAll(".close").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const win = e.target.closest(".window");
                win.style.setProperty('display', 'none', 'important');
                if(win.dataset.top) {
                win.style.top = win.dataset.top;
                win.style.left = win.dataset.left;
                win.style.width = win.dataset.width;
                win.style.height = win.dataset.height;
                }
                activeWindows = activeWindows.filter(id => id !== win.id);
                if(activeFolder === win.id) activeFolder = null;
            })
        });

        // to make cancel btn close the window
        document.querySelectorAll("#cancel").forEach(btn => {
            btn.addEventListener("click", (e) => {
                let win = e.target.closest(".window");
                if(win) {
                    win.style.setProperty('display', 'none', 'important');
                    activeWindows = activeWindows.filter( id => id !== win.id);
                    return;
                }
                win = e.target.closest(".alert-box");
                if (win) {
                    win.style.setProperty('display', 'none', 'important');
                    activeWindows = activeWindows.filter( id => id !== win.id);
                    return;
                }
            })
        })

        //to make submit button works when click
        document.querySelector('#create').addEventListener("click", (e) => {
            const input = document.getElementById("file-create");
            let value = input.value.trim();

            if(value.trim() ==="") {
                alertBox("Sorry Enter Some 'Name' to create a file")
                input.value = "";
                return;
            }

            const fileExistingCheck = files.find(file => file.id === `${value}-file`);
            if(fileExistingCheck) {
                alertBox("File Already Exists.");
                input.value = "";
                return;
            }

            input.value = "";
            createIcons(`${value}-file-icon`, "assets/icons/hypercard.svg", value);
            createWindow(`${value}-file`, value, "true");
        });

        //ok button to work for alert button
        document.querySelector("#alert-okay").addEventListener('click', (e) =>{
            const alertBox = document.querySelector(".alert-box");
            alertBox.style.setProperty('display', 'none', 'important');
        })

    //double clicking the window will open window fixed pos but can drag around
    document.querySelectorAll(".homeIcons").forEach(btn =>{
        btn.addEventListener("dblclick", (e) =>{
            e.stopPropagation();
            const windowId = btn.id.replace("-icon", "");

            const windowDiv = document.getElementById(windowId)
            if (windowDiv) {
                const displayMode = windowDiv.id.includes("-file") ? 'flex' : 'block';
                windowDiv.style.setProperty('display', 'none', 'important');
                windowDiv.style.margin = '0';
                const id = activeWindows.indexOf(windowId);
                if (id === -1) activeWindows.push(windowId);

                if (displayMode === "flex") {
                    activeFolder = null;
                } else {
                    activeFolder = windowId;
                }

                bringWindowToTop(windowId);
            }
            console.log(activeWindows);
        })
    });
}

function dragElementWindow(element) {

    var initialX = 0;
    var initialY = 0;
    var currentX = 0;
    var currentY = 0;
    //console.log(element);


    function startDragging(e) {
        //e = e || window.event;
        if(e.target.closest('button')) return;
        if(e.target.closest('input')) return;
        if (e.target.closest(".window-pane")) return;

        e.preventDefault();
        // get the mouse cursor position at startup

        const rect = element.getBoundingClientRect();
        element.style.top = rect.top + 'px';
        element.style.left = rect.left + 'px';
        element.style.margin = '0';

        initialX = e.clientX;
        initialY = e.clientY;

        element.style.margin = '0';
        //set up event listeners for mouse movement and mouse button release
        bringWindowToTop(element.id);

        document.onmouseup = stopDragging;
        document.onmousemove = dragging;
    };
    element.onmousedown = startDragging;

    //calculating dragging position
    function dragging(e) {
        e = e || window.event;
        e.preventDefault();

        const childRect = element.getBoundingClientRect();


        currentX = initialX - e.clientX;
        currentY = initialY - e.clientY;

        initialX = e.clientX;
        initialY = e.clientY;

        let newX = parseFloat(element.style.left) - currentX;
        let newY = parseFloat(element.style.top) - currentY;

        newX = Math.max(0, Math.min(newX, window.innerWidth - childRect.width));
        newY = Math.max(homeRect.top, Math.min(newY, window.innerHeight - childRect.height));

        // update the elements new position
        element.style.position = 'absolute';
        element.style.top = (newY) + 'px';
        element.style.left = (newX) + 'px';

        if(element.dataset.dragging === ''){
            element.style.margin = '0';

            const rect = element.getBoundingClientRect();
            element.style.left = rect.left + 'px';
            element.style.top = rect.top + 'px';
            element.dataset.dragging = 'true';
        }
    };


    function stopDragging() {
        element.style.filter = '';
        document.onmouseup = null;
        document.onmousemove = null;
    };
};


function dragElement(element){

    var initialX = 0;
    var initialY = 0;
    var currentX = 0;
    var currentY = 0;
    //console.log(element);


    function startDragging(e){

        e.preventDefault();

        initialX = e.clientX;
        initialY = e.clientY;

        document.onmouseup = stopDragging;
        document.onmousemove = dragging;
    }
    element.onmousedown = startDragging;


    function dragging(e){
        e = e || window.event;
        e.preventDefault();

        const parentRect = document.querySelector(".home").getBoundingClientRect();
        const childRect = element.getBoundingClientRect();

        console.log("parentRect: ", parentRect);
        console.log("childRect: ", childRect);
        console.log("Y range: ", parentRect.top , '->', parentRect.bottom - childRect.height);


        currentX = initialX - e.clientX;
        currentY = initialY - e.clientY;

        initialX = e.clientX;
        initialY = e.clientY;

        let newX = parseFloat(element.style.left) - currentX;
        let newY = parseFloat(element.style.top) - currentY;

        newX = Math.max(0, Math.min(newX, parentRect.width - childRect.width));
        newY = Math.max(0, Math.min(newY, parentRect.height - childRect.height));


        element.style.filter = 'invert(1)';
        element.style.position = 'absolute';
        element.style.top = (newY) + 'px';
        element.style.left = (newX) + 'px';
    }


    function stopDragging(){
        element.style.filter = '';
        document.onmouseup = null;
        document.onmousemove = null;
    }
};


function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById("clock").textContent = time;
};

updateTime();
setInterval(updateTime, 1000);




const happyMac = document.querySelector(".mac-alone");
const welcome = document.querySelector(".welcome-animation");
const parentForAnimation = document.querySelector(".loading-animation");

function fadeIn(element, duration = 500) {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '1';
}

function fadeOut(element, duration = 500, onDone) {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';
    element.addEventListener('transitionend', () => {
        if (onDone){
            onDone();
        }
    }, { once: true });
}

function playLoadingAnimation() {
    happyMac.style.opacity = '0';

    fadeIn(happyMac, 100);

    setTimeout(() => {
        fadeOut(happyMac, 100, () => {
            happyMac.style.setProperty('display', 'none', 'important');

            welcome.style.setProperty('display', 'flex', 'important');
            welcome.style.opacity = '0';
            fadeIn(welcome, 1500);

            setTimeout(() => {
                fadeOut(welcome, 100, () => {
                    welcome.style.setProperty('display', 'none', 'important');
                    parentForAnimation.style.setProperty('display', 'none', 'important');
                    document.querySelector(".after-loading").style.setProperty('display', 'flex', 'important');
                    init();
                });
            }, 100);
        });
    }, 100)
}

playLoadingAnimation();

document.getElementById("open").addEventListener('click', (e) => {
    const win = document.getElementById("open-folder");
    win.style.setProperty('display', 'block', 'important');

    const fileList = document.getElementById("file-list");
    fileList.innerHTML = "";

    bringWindowToTop("openp-folder");

    files.forEach(file => {
        const item = document.createElement("div");
        item.className = "flex items-center gap-2 cursor-pointer px-1";
        item.innerHTML = `
        <img src="${file.iconSrc}" width="16" height="16" />
        <span class="text-sm!">${file.label}</span>`

        item.addEventListener("dblclick", (e) => {
            const win = document.getElementById(file.id);
            if(win) {
                win.style.setProperty("display", "block", "important");
                const id = activeWindows.indexOf(file.id);
                if(id === -1) activeWindows.push(file.id);
                bringWindowToTop(file.id);
                if (file.id.includes("-file")){
                    activeFolder = null;
                } else {
                    activeFolder = file.id;
                }
            }
        })
        fileList.appendChild(item);
    })

    document.activeElement.blur();
});

document.getElementById("new-file").addEventListener('click', (e) => {
    const win = document.getElementById("new-folder");
    win.style.setProperty('display', 'block', 'important');

    document.activeElement.blur();

    bringWindowToTop("new-folder");

    win.style.top = (window.innerHeight / 2) - (win.offsetHeight / 2) + 'px';
    win.style.left = (window.innerWidth / 2) - (win.offsetWidth / 2) + 'px';
});

function createIcons(id, iconSrc, label) {
    const div = document.createElement("div");
    div.id = id;
    div.className = "homeIcons";

    div.innerHTML = `
    <div>
    <img src="${iconSrc}" alt="${label} width="24" height="24" draggable="false"/>
    </div>
    <div>
    <p class="text-sm! w-fit font-normal bg-white text-back">${label}</p>
    </div>
    `;
    document.querySelector(".home").appendChild(div);

    const idFile = id.replace("-icon", "");

    file.push({ id: idFile, label: label, iconSrc: iconSrc });

    div.style.position = "absolute";
    div.style.left = (col * iconSize) + 'px';
    div.style.top = (row * iconSize) + 'px';

    row++;

    if(row >= iconsPerCol) {
        row = 0;
        col++;
    }

    div.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll(".homeIcons").forEach(icon => icon.style.filter = '');
        div.style.filter = "invert(1)";
    })

    dragElement(div);

    div.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const winId = id.replace("-icon","");
        const win = document.getElementById(winId);
        if(win) {
            const displayMode = win.id.includes('-file') ? 'flex' : 'block';
            console.log(displayMode);
            win.style.setProperty('display', displayMode, 'important');
            win.style.margin = '0';
            const title = win.querySelector(".tittle");
            if(title) title.textContent = label;

            const panel = win.querySelector(".window-pane");
            if(panel) panel.contentEditable = "true";
            panel.focus();

            const idThere = activeWindows.indexOf(winId);
            if(idThere === -1) activeWindows.push(winId);
            bringWindowToTop(winId);

            if (displayMode === "flex") {
                activeFolder = null;
            } else {
                activeFolder = winId;
            }
        }
        console.log(activeWindows);
    });
}

//to close current specific window from nav bar
document.getElementById("close-win").addEventListener("click", (e) =>{
    e.stopPropagation();
    const lastWinId = activeWindows.pop();
    if (lastWinId) {
        const lastWinDiv = document.getElementById(lastWinId);
        lastWinDiv.style.setProperty('display', 'none', 'important');
        if (activeFolder === lastWinId) activeFolder = null;
    }
    document.activeElement,blur();
})

//close all windows from the nav bar
document.getElementById("close-all-win").addEventListener("click", (e) => {
    e.stopPropagation();
    for(let i = 0; i<activeWindows.length; i++){
        const win = document.getElementById(activeWindows[i]);
        if(win) win.style.setProperty('display','none','important');
    }
    activeWindows = [];
    activeFolder = null;
    document.activeElement,blur();
});

function bringWindowToTop(winId){
    if(!winId) return;
    activeWindows.filter(id => id!== winId);
    activeWindows.push(winId);
    activeWindows.forEach((id,index) => {
        const win = document.getElementById(id);
        if(win) win.style.zIndex = (100 + index).toString();
    });

    if(winId.includes("-file")) {
        activeFolder = null;
    } else {
        activeFolder = winId;
    }
}

document.getElementById("open-open").addEventListener("click", (e) => {
    e.stopPropagation();
    const input = document.getElementById("open-input-field");
    const value = input.value.trim();

    if (value === "") {
        alertBox("Enter Some File Name.");
        return;
    };

    const file = files.find(f => f.label === value);
    if (!file) {
        console.log("no file found");
        alertBox("File not found. Check the name and try again");
        return;
    }

    const win = document.getElementById(file.id);
    if (win) {
        win.style.setProperty('display', 'block', 'important');
        const index = activeWindows.indexOf(file.id);
        if (index === -1) activeWindows.push(file.id);
        bringWindowToTop(file.id);
        input.value = "";
    }
});

function alertBox(content) {
    const alertBox = document.querySelector(".alert-box");
    const alertText = alertBox.querySelector(".alert-text");

    alertText.textContent = content;

    alertBox.style.visibility = "hidden";
    alertBox.style.setProperty('display', 'block', 'important');
    alertBox.style.left = (window.innerWidth / 2) - (alertBox.offsetWidth / 2) + 'px';
    alertBox.style.top = (window.innerHeight / 2) - (alertBox.offsetHeight / 2) + 'px';

    alertBox.style.zIndex = '2000';

    alertBox.style.visibility = ''
}

function createWindow(id, name, editable = 'false') {
    const div = document.createElement("div");
    div.id = id;
    div.className = "window fixed w-64 h-48 z-10 flex! flex-col! overflow-hidden!";
    div.style.setProperty('display', 'none', 'important');
    const titleDiv = document.createElement("div");
    titleDiv.className = "title-bar";
    const closeBtn = document.createElement("button");
    closeBtn.className = "close";
    closeBtn.setAttribute("aria-label", "Close");
    const resizeBtn = document.createElement("button");
    resizeBtn.className = "resize";
    resizeBtn.setAttribute("aria-label", "Resize");
    const titleH1 = document.createElement('h1');
    titleH1.className = "title";
    titleH1.textContent = name;

    titleDiv.appendChild(closeBtn);
    titleDiv.appendChild(titleH1);
    titleDiv.appendChild(resizeBtn);

    const seperatorDiv = document.createElement("div");
    seperatorDiv.className = "seperator";

    const windowPane = document.createElement("div");
    windowPane.className = "window-pane flex-1 overflow-y-auto! min-h-0";
    windowPane.contentEditable = editable;

    div.appendChild(titleDiv);
    div.appendChild(seperatorDiv);
    div.appendChild(windowPane);

    document.querySelector(".after-loading").appendChild(div);

    closeBtn.addEventListener("click", (e) => {
        div.style.setProperty("display", "none", "important");
        activeWindows = activeWindows.filter(winId => winId !== id);
        if (activeFolder === id) activeFolder = null;
    });

    resizeBtn.addEventListener("click", (e) =>{
        const win = e.target.closest(".window");
        if (win.dataset.full === "true") {
            win.style.width = win.dataset.width;
            win.style.height = win.dataset.height;
            win.style.top = win.style.top;
            win.style.left = win.dataset.left;

            win.style.margin = '0';

            win.dataset.full = "false";
        } else {
            win.dataset.width = div.style.width;
            win.dataset.height = div.style.height;
            win.dataset.top = div.style.top;
            win.dataset.left = div.style.left;

            win.style.width = homeRect.width + "px";
            win.style.height = homeRect.height + "px";
            win.style.top = homeRect.top + "px";
            win.style.left = homeRect.left + "px";

            win.dataset.full = "true";

            win.style.margin = "0";
        }
    })

    div.addEventListener("click", () => {
        if(div.style.display !== "none") bringWindowToTop(id);
    })

    div.style.visibility = "hidden";
    div.style.setProperty("display", "block", "important");
    div.style.top = (window.innerHeight / 2) - (div.offsetHeight / 2) + "px";
    div.style.left = (window.innerWidth / 2) - (div.offsetWidth / 2) + "px";
    div.style.setProperty("display", "none", "important");
    div.style.visibility = "";

    dragElement(div);
};

function sortIcons(sortFn) {
    if (activeFolder !== "open-folder" && activeFolder !== "system-folder") return;

    const sorted = [...files].sort(sortFn);

    let fileList;
    if (activeFolder === "open-folder") {
        fileList = document.getElementById("file-list");
    } else {
        fileList = null;
        return;
    }
    fileList.innerHTML = "";
    sorted.forEach(file => {
        const item = document.createElement("div");
        item.className = "flex items-center gap-2 cursor-pointer px-1";
        item.innerHTML = `
        <img src= "${file.iconSrc}" width = "16" height="16" />
        <span class = "text-sm!">${file.label}</span>
        `;
        item.addEventListener("dblclick", (e) => {
            const win = document.getElementById(file.id);
            if (win) {
                win.style.setProperty("display", "block", "important");
                const id = activeWindows.indexOf(file.id);
                if(id === -1) activeWindows.push(file.id);
                bringWindowToTop(file.id);
            }
        })
        fileList.appendChild(item);
    })
}

document.getElementById("by-name").addEventListener("click", (e) => {
    sortIcons((a, b) => a.label.toLowerCase().localCompare(b.label.toLowerCase()));
});

document.getElementById("by-kind").addEventListener("click", (e) => {
    sortIcons((a, b) => {
        const isFileA = a.id.includes("-file") ? 1: 0;
        const isFileB = b.id.includes("-file") ? 1: 0;

        return isFileA - isFileB;
    });
});