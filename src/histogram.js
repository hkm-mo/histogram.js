"use strict";
(function () {
	var Int32Array = typeof Int32Array === "undefined" ? Array : Int32Array;
	
	function Histogram() {
		this.data = {};
	}
	
	Histogram.prototype.addCategory = function(category, length){
		this.data[category] = new Int32Array(length) .fill(0);
	};
	
	Histogram.prototype.getCategory = function(category, returnRef){
		if (this.data[category]) {
			return returnRef ? this.data[category] : this.data[category].slice(0);
		} else {
			throw new Error("histogram.js: No category \"" + category +"\".");
		}
	};
	
	Histogram.prototype.increaseFrequency = function(category, value){
		var frequency = ++this.data[category][value];
	};
	
	Histogram.prototype.peak = function (categories) {
		var peak = 0;
		var dataSet;
		if (categories) {
			dataSet = {};
			var cLen = categories.length;
			for (var i = 0; i  < cLen; i ++) {
				var cat = categories[i];
				dataSet[cat] = this.getCategory(cat, true);
			}
		} else {
			dataSet = this.data;
		}
		
		for (var data in dataSet) {
			if (dataSet.hasOwnProperty(data)) {
				var categoryData = dataSet[data];
				var cdLen = categoryData.length;
				for (var i = categoryData.length - 1 ; i >= 0; i--) {
					var frequency = categoryData[i];
					if (frequency > peak) {
						peak = frequency;
					}
				}
			}
		}
		return peak;
	};
	
	Histogram.prototype.select = function(categories){
		var histogram = new Histogram();
		var cLen = categories.length;
		for (var i = 0; i  < cLen; i ++) {
			var cat = categories[i];
			histogram.data[cat] = this.getCategory(cat);
		}
		return histogram;
	};
	
	Histogram.prototype.plotToCanvas = function(canvas, config){
		return new HistogramGraph(this, canvas, config);
	};
	
	Histogram.createFromImage = function (img, config) {
		config = config || {};
		var histogram = new Histogram();
		histogram.addCategory("red", 256);
		histogram.addCategory("green", 256);
		histogram.addCategory("blue", 256);
		histogram.addCategory("apha", 256);
		
		if (config.maxWidth && img.width > config.maxWidth) {
			img.height *= config.maxWidth / img.width;
			img.width = config.maxWidth;
		} else if(config.maxHeight && img.height > config.maxHeight) {
			img.width *= config.maxHeight / img.height;
			img.height = config.maxHeight;
		}
		
		var canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		var context = canvas.getContext("2d");
		context.drawImage(img, 0, 0);
		
		var colorData = context.getImageData(0, 0, img.width, img.height).data;
		for (var i = colorData.length - 1; i >= 0; i -= 4) {
			histogram.increaseFrequency("red", colorData[i-3]);
			histogram.increaseFrequency("green", colorData[i-2]);
			histogram.increaseFrequency("blue", colorData[i-1]);
			histogram.increaseFrequency("apha", colorData[i]);
		}
		
		return histogram;
	};
	
	function HistogramGraph(histogram, canvas, config) {
		var canvasA = document.createElement("canvas");
		canvas.width = config.width;
		canvas.height = config.height;
		
		this.config = config;
		this.histogram = histogram;
		this.context = canvas.getContext("2d");
		
		this.categoryNameList = [];
		if (config.categories) {
			for (var catName in config.categories) {
				if (config.categories.hasOwnProperty(catName)) {
					this.categoryNameList.push(catName);
				}
			}
		} else {
			throw new Error("histogram.js: categories must be configured.");
		}
		
		this.draw();
	}
	
	HistogramGraph.prototype.draw = function(){
		var width = this.config.width,
			height = this.config.height;
		
		var maxFrequency = this.histogram.peak(this.categoryNameList),
			frequencyStep = height / maxFrequency;
		
		this.context.clearRect(x, y, width, height);
		
		for (var i = this.categoryNameList.length - 1; i >= 0; i--) {
			var catName = this.categoryNameList[i],
				catConfig = this.config.categories[catName],
				catData = this.histogram.getCategory(catName, true),
				valStep = (width) / (catData.length-1),
				x, y;
			
			this.context.beginPath();
			this.context.moveTo(width, height);
			this.context.lineWidth = catConfig.lineWidth;
			this.context.fillStyle = catConfig.fillStyle;
			this.context.strokeStyle = catConfig.strokeStyle;
			
			for (var value = catData.length - 1; value >= 0; value--) {
				var frequency = catData[value];
				y = height - frequency * frequencyStep,
				x = value * valStep;
				
				this.context.lineTo(x, y);
			}
			
			if (x !== null) {
				this.context.lineTo(x, height);
			}
			this.context.stroke();
			this.context.fill();
		}
	};
	
	window.Histogram = Histogram;
	
})();