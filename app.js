var amount_of_rectangles = 5;
var rects = [];
var outputRects = [];
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

function returnIndexesInLS() {
    const values = [];
    for (var i = 0, len = localStorage.length; i < len; ++i) {
        values.push(parseFloat(localStorage.key(i)));
    }
    return _.without(values, undefined, null, NaN);
}

function showHistory() {
    const availableEntries = returnIndexesInLS();
    document.getElementById("history-rows").innerHTML = "";
    if (!availableEntries || availableEntries.length === 0) {
        fillBodyOfNoEntries();
    } else {
        var table = document.createElement("table");
        table.className = "table table-hover";
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
                console.log(rects);
                drawRects('canvasInput', rects);
            });
            table.appendChild(row);
        });
    }
    document.getElementById("history-rows").appendChild(table);
    $("#historyModal").modal('show');
}

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
    buildOutputRectangles();
}

function getParamsFromHumanString(str) {
    console.log();
    const newRectangle = new Rectangle(str.split("=")[1].split(",")[0],
        str.split("=")[2].split(",")[0],
        str.split("=")[3].split(",")[0],
        str.split("=")[4].split(",")[0]);
    rects.push(newRectangle);
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
        lastIndex = source === 'input' ? "1" : 'output_result_rectangles_with_index_1';
    } else {
        lastIndex = source === 'input' ? lastIndex + 1 : `output_result_rectangles_with_index_${lastIndex + 1}`;
    }
    localStorage.setItem(lastIndex.toString(), JSON.stringify(result_array));
}

function buildRandomRectangles() {
    rects.length = 0;
    outputRects.length = 0;
    var c = document.getElementById("canvasInput");
    c.height = c.offsetHeight;
    c.width = c.offsetWidth;
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.offsetWidth, c.offsetHeight);
    var nextRectLeftPosition = 0;
    var availableSpaceInCanvas = c.offsetWidth;
    var heightOfCanvas = c.offsetHeight;
    ctx.lineWidth = "1";
    for (var i = 0; i < amount_of_rectangles; i++) {
        const rectWidth = returnRandomIndex(1, availableSpaceInCanvas / (amount_of_rectangles / 3));
        const rectHeight = returnRandomIndex(1, heightOfCanvas);
        const newRectangle = new Rectangle(nextRectLeftPosition,
            heightOfCanvas - rectHeight,
            rectWidth,
            rectHeight);
        rects.push(newRectangle);
        ctx.rect(newRectangle.x, newRectangle.y, newRectangle.width, newRectangle.height);
        ctx.stroke();
        availableSpaceInCanvas = availableSpaceInCanvas - newRectangle.width;
        nextRectLeftPosition = nextRectLeftPosition + newRectangle.width;
    }
    buildOutputRectangles();
}

function buildOutputRectangles() {
    var c = document.getElementById("canvasOutput");
    c.height = c.offsetHeight;
    c.width = c.offsetWidth;
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.offsetWidth, c.offsetHeight);
    ctx.lineWidth = "1";

    returnRectangleWithCurrentMinHeight(rects, 0);
    const lastIndex = getLastIndexInLocalStorage();
    saveRectsInLocalStorage(rects, 'input', lastIndex);
    saveRectsInLocalStorage(outputRects, 'output', lastIndex);
    _.each(outputRects, function (rect) {
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.stroke();
    });
}

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

function returnRandomIndex(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

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
