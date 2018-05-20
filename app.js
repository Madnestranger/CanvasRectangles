var amount_of_rectangles = 5;
var rects = [];
var outputRects = [];
const localStorageOutputRectanglesPrefix = "output_result_rectangles_with_index_";
document.getElementById("rectangles-amount").value = amount_of_rectangles;

function Rectangle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

function getLastIndexInLocalStorage() {
    return _.max(returnIndexesInLS());
}

// return all indexes which are stored in Local Storage
function returnIndexesInLS() {
    const values = [];
    for (var i = 0, len = localStorage.length; i < len; ++i) {
        values.push(parseFloat(localStorage.key(i)));
    }
    return _.without(values, undefined, null, NaN);
}

// generate markup for history popup
function showHistory() {
    const availableEntries = _.orderBy(returnIndexesInLS());
    document.getElementById("history-rows").innerHTML = "";
    if (!availableEntries || availableEntries.length === 0) {
        fillBodyOfNoEntries();
    } else {
        var table = document.createElement("table");
        table.className = "table";
        table.style.marginBottom = "0";
        availableEntries.forEach(function (index) {
            var row = document.createElement("tr");
            var td = document.createElement("td");
            td.innerHTML = index.toString();
            row.appendChild(td);
            row.setAttribute('data-index', index);
            row.addEventListener("click", function (ev) {
                rects.length = 0;
                JSON.parse(localStorage.getItem(ev.srcElement.innerHTML)).forEach(function (str) {
                    getParamsFromHumanString(str);
                });
                drawRects('canvasInput', rects);
                buildOutputRectangles(true);
                $("#historyModal").modal('hide');
            });
            table.appendChild(row);
        });
        document.getElementById("history-rows").appendChild(table);
    }
    $("#historyModal").modal('show');
}

// function for drawing rectangles on canvas
function drawRects(canvasId, rects) {
    var c = document.getElementById(canvasId);
    c.height = c.offsetHeight;
    c.width = c.offsetWidth;
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.offsetWidth, c.offsetHeight);
    rects.forEach(function (rect) {
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.stroke();
    });
}

function getParamsFromHumanString(str) {
    const newX = parseFloat(str.split("=")[1].split(",")[0]);
    const newY = parseFloat(str.split("=")[2].split(",")[0]);
    const newWidth = parseFloat(str.split("=")[3].split(",")[0]);
    const newHeight = parseFloat(str.split("=")[4].split(",")[0]);
    if (!!newX && !!newY && !!newWidth && !!newHeight) {
        const newRectangle = new Rectangle(newX, newY, newWidth, newHeight);
        rects.push(newRectangle);
    }
}

function fillBodyOfNoEntries() {
    var div = document.createElement("div");
    div.className = "no-entries";
    div.innerHTML = 'NO ENTRIES';
    document.getElementById("history-rows").appendChild(div);
}

function saveRectsInLocalStorage(array, source, lastIndex) {
    var result_array = [];
    array.forEach(function (rect) {
        result_array.push(`Rectangle with parameters: x=${rect.x}, y=${rect.y}, width=${rect.width}, height=${rect.height}`);
    });
    if (!lastIndex) {
        lastIndex = source === 'input' ? 1 : `${localStorageOutputRectanglesPrefix}1`;
    } else {
        lastIndex = source === 'input' ? lastIndex + 1 : `${localStorageOutputRectanglesPrefix}${lastIndex + 1}`;
    }
    localStorage.setItem(lastIndex.toString(), JSON.stringify(result_array));
}

// function for building random rectangles
function buildRandomRectangles() {
    rects.length = 0;
    var c = document.getElementById("canvasInput");
    var nextRectLeftPosition = 0;
    var availableSpaceInCanvas = c.offsetWidth;
    var heightOfCanvas = c.offsetHeight;
    for (var i = 0; i < amount_of_rectangles; i++) {
        const rectWidth = returnRandomIndex(1, availableSpaceInCanvas / (amount_of_rectangles / 3));
        const rectHeight = returnRandomIndex(1, heightOfCanvas);
        const newRectangle = new Rectangle(nextRectLeftPosition,
            heightOfCanvas - rectHeight,
            rectWidth,
            rectHeight);
        rects.push(newRectangle);
        availableSpaceInCanvas = availableSpaceInCanvas - newRectangle.width;
        nextRectLeftPosition = nextRectLeftPosition + newRectangle.width;
    }
    drawRects("canvasInput", rects);
    buildOutputRectangles();
}

function buildOutputRectangles(justRender) {
    outputRects.length = 0;
    returnRectangleWithCurrentMinHeight(rects, 0);
    const lastIndex = getLastIndexInLocalStorage();
    if (!justRender) {
        saveRectsInLocalStorage(rects, 'input', lastIndex);
        saveRectsInLocalStorage(outputRects, 'output', lastIndex);
    }
    drawRects('canvasOutput', outputRects);
}

// function to render rectangle with the lowest high in area
function returnRectangleWithCurrentMinHeight(viewedRects, minY) {
    if (viewedRects.length === 0) return;
    if (viewedRects.length === 1) {
        outputRects.push(new Rectangle(viewedRects[0].x, viewedRects[0].y, viewedRects[0].width, viewedRects[0].height - minY));
        return;
    } else {
        var rectWithMinHeight = _.minBy(viewedRects, function (x) {
            return x.height;
        });
        var indexOfFirstRect = viewedRects.indexOf(rectWithMinHeight);
        outputRects.push(new Rectangle(viewedRects[0].x, rectWithMinHeight.y, _.sumBy(viewedRects, function (x) {
            return x.width;
        }), rectWithMinHeight.height - minY));
        var leftSideRects = viewedRects.slice(0, indexOfFirstRect);
        var rightSideRects = viewedRects.slice(indexOfFirstRect + 1, viewedRects.length);
        returnRectangleWithCurrentMinHeight(leftSideRects, rectWithMinHeight.height);
        returnRectangleWithCurrentMinHeight(rightSideRects, rectWithMinHeight.height);
    }
}

// generate random index
function returnRandomIndex(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

// function for checking amount of rectangles
function checkIfValidAmountOfRectangles(element) {
    const value = element.value;
    if (value < 3) {
        element.value = 3;
        amount_of_rectangles = 3;
    } else {
        if (value > 30) {
            element.value = 30;
            amount_of_rectangles = 30;
        } else {
            amount_of_rectangles = value;
        }
    }
}
