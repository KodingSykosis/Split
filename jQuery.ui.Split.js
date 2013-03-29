(function ($) {
    $.widget("NerdyDudeDesigns.Split", {
        options: {
        	orientation: 'v',
        	minDistance: -1,
        	maxDistance: -1,
        	distance: -1,
        	sepColor: '#F4F4F4',
        	sepSize: 5,
        	primary: '.panel1'
        },

        // Set up the widget
        _create: function () {
        	var vert = this._isVert(),
        		primary = this.options['primary'];
        		
        	this.id = this.element.id();
        	
        	if (primary != '.panel1' && primary != '.panel2') {
        		this.options['primary'] = '.panel1';
        		primary = this.options['primary'];
        	}
        	
        	if (this.options['distance'] == -1) {
        		this.options['distance'] = (vert ? this.element.width() : this.element.height()) / 4;
        	}
        	
        	if (this.options['minDistance'] == -1) {
        		this.options['minDistance'] = 50;
        	}
        	
        	if (this.options['maxDistance'] == -1) {
        		this.options['maxDistance'] = 50;
        	}
        	
        	this.panel1 = $('<div>')
        		.addClass('panel1')
        		.css({
        			overflow: 'hidden',
        			position: 'absolute'
        		});
        	
        	
        	this.sep = $('<div>')
        		.css({
        			position: 'relative',
        			float: 'left',
        			backgroundColor: this.options['sepColor'],
        		})
        		.drag({
        			axis: vert ? 'left' : 'top',
        			cursor: vert ? 'ew-resize' : 'ns-resize',
        			drag: $.proxy(this._onSepDragging, this),
        			relativeTo: this.element,
        			containment: {
        				min: this.options['minDistance'],
        				max: this.options['maxDistance']
        			}
        		});
        			
        	this.panel2 = $('<div>')
        		.addClass('panel2')
        		.css({
        			overflow: 'hidden',
        			position: 'absolute'
        		});
        		
        	this.element
        		.empty()
        		.css('position', this.element.css('position') == 'absolute' ? 'absolute' : 'relative')
        		.append(this.sep)
        		.append(this.panel1)
        		.append(this.panel2);
        },
        
        _init: function() {
        	this.reset();
        },
        
        _destroy: function() {
        },

        // Use the _setOption method to respond to changes to options
        _setOption: function (key, value) {
            this.options[key] = value;
            $.debug('info', 'SetOption', key, value);

            // In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
            // In jQuery UI 1.9 and above, you use the _super method instead

            if (this._super)
                this._super("_setOption", key, value);
            else
                $.Widget.prototype._setOption.apply(this, arguments);
        },

        // Use the destroy method to clean up any modifications your widget has made to the DOM
        destroy: function () {
            // In jQuery UI 1.8, you must invoke the destroy method from the base widget
            // In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method

            $.Widget.prototype.destroy.call(this);
            this._destroy();
        },
        
        refresh: function(distance) {
        	if (distance) {
        		this.distance = distance;
        	}
        
        	var box = this._computeBoxModels(distance),
        		panels = this._getPanels();
        		
        	this.sep.css(box.separator);
        	panels.primary.css(box.primary);
        	panels.secondary.css(box.secondary);
        	
        	this.sep.drag('computeContainment', box.orgSeparator);
        	
        	$.debug('debug', 'Refresh Split', this.id);
        	
        	//if we have any children splits refresh them too
        	if (panels.primary.data('NerdyDudeDesignsSplit')) {
        		panels.primary.Split('refresh');
        	}
        	
        	if (panels.secondary.data('NerdyDudeDesignsSplit')) {
        		panels.secondary.Split('refresh');
        	}
        	
        },
        
        reset: function() {
        	this.refresh(this.options['distance']);
        	this.sep.drag('update');
        	
        	$.debug('info', 'Reset Split', this.id);
        },
        
        open: function() {
        },
        
        close: function() {
        },
        
        _onSepDragging: function(event, ui) {
        	var vert = this._isVert(),
        		invert = this._isInverted(),
        		origin = vert ? 'left' : 'top',
        		dimension = vert ? 'width' : 'height',
        		container = { width: this.element.width(), height: this.element.height() },
        		distance = (invert ? container[dimension] - this.sep.position()[origin] : this.sep.position()[origin]);
        	
        	$.debug('debug', 'onSepDragging', distance);
        	this.refresh(distance);
        },
        
/*
        _computeDraggingBounds: function() {
        	var vert = this._isVert(),
        		invert = this._isInverted(),
        		dimension = vert ? 'width' : 'height',
        		container = { width: this.element.width(), height: this.element.height() },
        		offset1 = (invert ? container[dimension] - this.options['maxDistance'] : this.options['distance'] + this.options['minDistance']),
        		offset2 = (invert ? container[dimension] - this.options['minDistance'] : this.options['distance'] + this.options['maxDistance']);
        		
			return {
        		x1:  vert ? offset1 : 0,
				y1: !vert ? offset1 : 0,
				x2:  vert ? offset2 : container[dimension],
				y2: !vert ? offset2 : container[dimension]
        	};
        },
*/
        
        _computeBoxModels: function(dist) {
        	var vert = this._isVert(),
        		invert = this._isInverted(),
        		origin = vert ? 'left' : 'top',
        		dimension = vert ? 'width' : 'height',
        		fill = vert ? 'height' : 'width',
        		container = { width: this.element.width(), height: this.element.height() },
        		distance = dist || this.distance,
        		
        		offset = this.options['sepSize'];
        		primary = $.emptyBox(),
        		secondary = $.emptyBox(),
        		separator = $.emptyBox()
        		orgSeparator = $.emptyBox(),
        		resized = !this.containerSize || this.containerSize != container[dimension];
        		
	        separator[origin] = invert ? container[dimension]-distance : distance;
	        separator[dimension] = offset;
	        separator[fill] = container[fill];
	        
	        orgSeparator[origin] = invert ? container[dimension]-this.options['distance'] : this.options['distance']
	        orgSeparator[dimension] = offset;
	        orgSeparator[fill] = container[fill];
	        
	        secondary[origin] = invert ? secondary[origin] : distance + offset;
	        secondary[dimension] = (invert ? separator[origin] : container[dimension] - distance - offset);
	        secondary[fill] = container[fill];
	        
	        primary[origin] = invert ? separator[origin] + offset : primary[origin];
	        primary[dimension] = (invert ? container[dimension] - separator[origin] - offset : distance);
	        primary[fill] = container[fill];
	        
	        this.containerSize = container[dimension];
	        	        
	        var box = {
	        	primary: primary,
	        	secondary: secondary,
	        	separator: separator,
	        	distance: separator[origin],
	        	orgSeparator: this.element.offsetRelativeTo('window', orgSeparator)
	        };
	        
	        $.debug('debug', 'Split BoxModel', box);
	        
	        return box;
        },
        
        _getPanels: function() {
        	var panels = this.element.children('.panel1, .panel2'),
        		primary = this.options['primary'];
        	
        	var results = {
        		primary: panels.filter( primary ),
        		secondary: panels.not( primary )
        	};
        	
        	$.debug('debug', 'getPanels', results);
        	
        	return results;
        },
        
        _isVert: function() {
        	return this.options['orientation'] == 'v';
        },
        
        _isInverted: function() {
        	return this.options['primary'] == '.panel2';
        }
    });
})(jQuery);