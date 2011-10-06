/**
 * Copyright (c) 2009-2010
 * processWave.org (Michael Goderbauer, Markus Goetz, Marvin Killing, Martin
 * Kreichgauer, Martin Krueger, Christian Ress, Thomas Zimmermann)
 *
 * based on oryx-project.org (Martin Czuchra, Nicolas Peters, Daniel Polak,
 * Willi Tscheschner, Oliver Kopp, Philipp Giese, Sven Wagner-Boysen, Philipp Berger, Jan-Felix Schwarz)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

/**
 * Init namespaces
 */
if(!ORYX) {var ORYX = {};}
if(!ORYX.Core) {ORYX.Core = {};}
if(!ORYX.Core.Math) {ORYX.Core.Math = {};}
	
/**
 * Calculate the middle point between two given points
 * @param {x:double, y:double} point1
 * @param {x:double, y:double} point2
 * @return the middle point
 */
ORYX.Core.Math.midPoint = function(point1, point2) {
	return 	{
				x: (point1.x + point2.x) / 2.0,
				y: (point1.y + point2.y) / 2.0
			}
}
			
/**
 * Returns a TRUE if the point is over a line (defined by
 * point1 and point 2). In Addition a threshold can be set,
 * which defines the weight of those line.
 * 
 * @param {int} pointX - Point X
 * @param {int} pointY - Point Y
 * @param {int} lPoint1X - Line first Point X
 * @param {int} lPoint1Y - Line first Point Y
 * @param {int} lPoint2X - Line second Point X
 * @param {int} lPoint2Y - Line second Point y
 * @param {int} offset {optional} - maximal distance to line
 * @class ORYX.Core.Math.prototype
 */
ORYX.Core.Math.isPointInLine = function (pointX, pointY, lPoint1X, lPoint1Y, lPoint2X, lPoint2Y, offset) {

	offset = offset ? Math.abs(offset) : 1;
	
	// Check if the edge is vertical
	if(Math.abs(lPoint1X-lPoint2X)<=offset && Math.abs(pointX-lPoint1X)<=offset && pointY-Math.max(lPoint1Y, lPoint2Y)<=offset && Math.min(lPoint1Y, lPoint2Y)-pointY<=offset) {
		return true
	}

	// Check if the edge is horizontal
	if(Math.abs(lPoint1Y-lPoint2Y)<=offset && Math.abs(pointY-lPoint1Y)<=offset && pointX-Math.max(lPoint1X, lPoint2X)<=offset && Math.min(lPoint1X, lPoint2X)-pointX<=offset) {
		return true
	}

	if(pointX > Math.max(lPoint1X, lPoint2X) || pointX < Math.min(lPoint1X, lPoint2X)) {
		return false
	}

	if(pointY > Math.max(lPoint1Y, lPoint2Y) || pointY < Math.min(lPoint1Y, lPoint2Y)) {
		return false
	}
			
	var s = (lPoint1Y - lPoint2Y) / (lPoint1X - lPoint2X);
	
	return 	Math.abs(pointY - ((s * pointX) + lPoint1Y - s * lPoint1X)) < offset
}

/**
 * Get a boolean if the point is in the polygone
 * 
 */
ORYX.Core.Math.isPointInEllipse = function (pointX, pointY, cx, cy, rx, ry) {

	if(cx === undefined || cy === undefined || rx === undefined || ry === undefined) {
		throw "ORYX.Core.Math.isPointInEllipse needs a ellipse with these properties: x, y, radiusX, radiusY"
	} 
	
    var tx = (pointX - cx) / rx;
    var ty = (pointY - cy) / ry;
	
    return tx * tx + ty * ty < 1.0;
}
	
/**
 * Get a boolean if the point is in the polygone
 * @param {int} pointX
 * @param {int} pointY
 * @param {[int]} Cornerpoints of the Polygone (x,y,x,y,...)
 */
ORYX.Core.Math.isPointInPolygone = function(pointX, pointY, polygone){

	if (arguments.length < 3) {
		throw "ORYX.Core.Math.isPointInPolygone needs two arguments"
	}
	
	var lastIndex = polygone.length-1;
	
	if (polygone[0] !== polygone[lastIndex - 1] || polygone[1] !== polygone[lastIndex]) {
		polygone.push(polygone[0]);
		polygone.push(polygone[1]);
	}
	
	var crossings = 0;

	var x1, y1, x2, y2, d;
	
    for (var i = 0; i < polygone.length - 3; ) {
        x1=polygone[i];
        y1=polygone[++i];
        x2=polygone[++i];
        y2=polygone[i+1];
        d=(pointY - y1) * (x2 - x1) - (pointX - x1) * (y2 - y1);

        if ((y1 >= pointY) != (y2 >= pointY)) {
            crossings += y2 - y1 >= 0 ? d >= 0 : d <= 0;
        }
        if (!d && Math.min(x1,x2) <= pointX && pointX <= Math.max(x1,x2)
            && Math.min(y1,y2) <= pointY && pointY <= Math.max(y1,y2)) {
            return true;
        }
    }
	return (crossings%2)?true:false;
}

/**
 *	Calculates the distance between a point and a line. It is also testable, if 
 *  the distance orthogonal to the line, matches the segment of the line.
 *  
 *  @param {float} lineP1
 *  	The starting point of the line segment
 *  @param {float} lineP2
 *  	The end point of the line segment
 *  @param {Point} point
 *  	The point to calculate the distance to.
 *  @param {boolean} toSegmentOnly
 *  	Flag to signal if only the segment of the line shell be evaluated.
 */
ORYX.Core.Math.distancePointLinie = function(
									lineP1, 
									lineP2, 
									point, 
									toSegmentOnly) {
	
	var intersectionPoint = 
				ORYX.Core.Math.getPointOfIntersectionPointLine(lineP1, 
																lineP2, 
																point, 
																toSegmentOnly);
	
	if(!intersectionPoint) {
		return null;
	}
	
	return ORYX.Core.Math.getDistancePointToPoint(point, intersectionPoint);
};

/**
 * Calculates the distance between two points.
 * 
 * @param {point} point1
 * @param {point} point2
 */
ORYX.Core.Math.getDistancePointToPoint = function(point1, point2) {
	return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
};

/**
 * Returns the intersection point of a line and a point that defines a line
 * orthogonal to the given line.
 * 
 *  @param {float} lineP1
 *  	The starting point of the line segment
 *  @param {float} lineP2
 *  	The end point of the line segment
 *  @param {Point} point
 *  	The point to calculate the distance to.
 *  @param {boolean} onSegmentOnly
 *  	Flag to signal if only the segment of the line shell be evaluated.
 */
ORYX.Core.Math.getPointOfIntersectionPointLine = function(
													lineP1, 
													lineP2, 
													point, 
													onSegmentOnly) {

	/* 
	 * [P3 - P1 - u(P2 - P1)] dot (P2 - P1) = 0
	 * u =((x3-x1)(x2-x1)+(y3-y1)(y2-y1))/(p2-p1)�
	 */
	var denominator = Math.pow(lineP2.x - lineP1.x, 2) 
						+ Math.pow(lineP2.y - lineP1.y, 2);
	if(denominator == 0) {
		return undefined;
	}
	
	var u = ((point.x - lineP1.x) * (lineP2.x - lineP1.x)  
			+ (point.y - lineP1.y) * (lineP2.y - lineP1.y))
			/ denominator;
			
	if(onSegmentOnly) {
		if (!(0 <= u && u <= 1)) {
			return undefined;
		}
	}
	
	pointOfIntersection = new Object();
	pointOfIntersection.x = lineP1.x + u * (lineP2.x - lineP1.x);
	pointOfIntersection.y = lineP1.y + u * (lineP2.y - lineP1.y);	
	
	return pointOfIntersection;												
};