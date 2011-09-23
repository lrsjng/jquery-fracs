

/******************
 * Cursor
 ******************/

Fracs.Cursor = function (distX, distY) {

    if (!(this instanceof Fracs.Mouse)) {
        return new Fracs.Mouse(distX, distY);
    }

    this.distX = distX;
    this.distY = distY;
    this.distMin = Math.min(distX, distY);
    this.distMax = Math.max(distX, distY);
};

$.extend(Fracs.Cursor, {
    prototype: {
        equals: function (that) {
    
            return this.distX === that.distX && this.distY === that.distY;
        },
        dist: function () {
    
            return Math.sqrt(this.distX * this.distX + this.distY * this.distY);
        }
    },
    ofRect: function (cursorX, cursorY, rect) {
    
        var x = cursorX < rect.left ? rect.left - cursorX : (cursorX > rect.right ? cursorX - rect.right : 0),
            y = cursorY < rect.top ? rect.top - cursorY : (cursorY > rect.bottom ? cursorY - rect.bottom : 0);
    
        return Fracs.Cursor(x, y);
    },
    ofElement: function (cursorX, cursorY, element) {
    
        return Fracs.Cursor.ofRect(cursorX, cursorY, Fracs.Rect.ofElement(element));
    }
});
