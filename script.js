// Make the DIV element draggable:

const homeRect = document.querySelectorAll(".home").getBoundingClientRect();
const iconSize = 68;

const iconsPerCol = Math.floor(homeRect.height / iconSize);

let row = 0;
let col = 0;

document.querySelectorAll('.homeIcons').forEach((element) => {

    const rect = element.getBoundingClientRect();
    element.style.position =  'absolute';
    element.style.left = (col * iconSize) + 'px';
    element.style.top = (row * iconSize) + 'px';

    row++;
    if(row >= iconsPerCol){
        row = 0;
        col++;
    }

    const beforeElement = document.createElement('div');
    beforeElement.style.width = rect.width + 'px';
    beforeElement.style.height = rect.height + 'px';
    beforeElement.style.visibility = 'hidden';

    element.parentNode.insertBefore(beforeElement, element);

    element.addEventListener('click', (event) => {
        event.stopPropagation;
        document.querySelectorAll('homeIcons').forEach((element) => {
            element.computedStyleMap.filter = '';
        })
        element.style.filter = 'invert(1)';
    })
    dragElement(element);
});

document.body.addEventListener('click', (e) => {
    if(!e.target.closest('.homeIcons')){
        document.querySelectorAll('.homeIcons').forEach((element) =>{
            element.style.filter = '';
        })
    }
});

document.querySelectorAll(".window").forEach(win =>{

    win.style.visibility = "hidden";
    win.style.display = "block";

    win.style.top = (window.innerHeight / 2) - (win.offsetHeight / 2) + 'px';
    win.style.left = (window.innerWidth / 2) - (win.offsetWidth / 2) + 'px';

    win.style.visibility = "";
    win.style.display = "none";
});


function dragElement(element){
    
    var initialX = 0;
    var initialY = 0;
    var currentX = 0;
    var currentY = 0;
    console.log(element);


    function startDragging(e){
        e = e || window.event;
        e.preventDefault();

        initialX = e.clientX;
        initialY = e.clientY;

        document.onmouseup = stopDragging;
        document.onmousemove = dragging;
    };
    element.onmousedown = startDragging;

    
    function dragging(e){
        e = e || window.event;
        e.preventDefault();

        const parentRect = document.querySelector(".home").getBoundingClientRect();
        const childRect = element.getBoundingClientRect();

        console.log("parent: ",parentRect)
        console.log("child: ", childRect)
        console.log("Y range: ", parentRect.top, '->', parentRect.bottom - childRect.height)
        
        
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
    };


    function stopDragging(){
        element.style.filter = '';
        document.onmouseup = null;
        document.onmousemove = null;
    };
};

function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById("clock").textContent = time;
};


document.querySelectorAll(".close").forEach(btn => {
    btn.addEventListener("click", (e) =>{
        const win = e.target.closest(".window");
        win.style.display = "none";
    });

});

document.querySelectorAll(".resize").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const win = e.target.closest(".window");

        if(win.dataset.full === "true"){
            win.style.width = win.dataset.width;
            win.style.height = win.dataset.height;
            win.style.top = win.dataset.top;
            win.style.left = win.dataset.left;

            win.dataset.full = "false";

            win.style.margin = "";
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
        };
    });
});

document.querySelectorAll(".homeIcons").forEach(btn => {
    btn.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        const windowId = btn.id.replace("-icon", "");

        const windowDiv = document.getElementById(windowId);
        if(windowDiv){
            windowDiv.style.display = "block";
        };
    });
});

updateTime();
setInterval(updateTime, 1000);

