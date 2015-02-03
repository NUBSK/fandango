/*
 * Fandango - SEO and accessible audio player
 * Copyright 2014, National and Universit Library "St. Clement of Ohrid" - Skopje, Macedonia
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * 
 */

(function($){
	$.fn.fandango = function(options){
		var self = this;
		
		var slider = null;

		var parentSelector = '';

		var icons = [
			{
				label: 'fast-backward',
				position: 'left'
			}, 
			{
				label: 'backward',
				position: 'left'
			}, 
			{
				label:'play',
				position: 'left'
			}, 
			{
				label:'pause',
				position: 'left'
			}, 
			{
				label:'stop',
				position: 'left'
			}, 
			{
				label:'forward',
				position: 'left'
			}, 
			{
				label:'fast-forward',
				position: 'left'
			}, 
			{
				label:'volume-off',
				position: 'right'
			}, 
			{
				label:'volume-down',
				position: 'right'
			}, 
			{
				label:'volume-up',
				position: 'right'
			}, 
			{
				label:'question-sign',
				position: 'right'
			}, 
			{
				label:'microphone',
				position: 'right'
			}];
		var controls = ['prevTrack', 'rewind', 'play', 'play', 'stop', 'forward', 'nextTrack', 'mute', 'volumeDown', 'volumeUp', 'help', 'listen'];

		var isListening = false;

		var meta = {
			title: '',
			altTitle: '',
			author: [],
			issued: '',
			publisher: '',
			narrator: '',
			toc: [],
			source: [],
			vttSource: [],
			isbn: '',
			uri: '',
			description: '',
			subject: '',
			keyword: ''
		};

		var settings = $.extend({
			coverContainer : true,
    		descriptionContainer : true,
    		transcriptContainer : true,
    		trackContainer : true,
    		statusContainer: true,
    		progressContainer: true,
    		vtt: 1,
    		microdata: 1,
    		dataUrl: '',
    		imgUrl : '',
    		skipSeconds: 10,
    		headMicrodata: false,
    		lang: '',
    		fallbackLng: 'mk',
    		webAudio: false,
    		dublinCore: 'dublin_core.xml',
    		skipDublinCore: false,
    		metadata:{
				title: '',
				altTitle: '',
				author: [],
				issued: '',
				publisher: '',
				narrator: '',
				toc: [],
				source: [],
				vttSource: [],
				isbn: '',
				uri: '',
				description: '',
				subject: '',
				keyword: ''
			},
    		shortcuts: {
    			play : 'p',
    			stop : 's',
    			forward : 't',
    			rewind : 'r',
    			volumeUp : 'l',
    			volumeDown : 'q',
    			mute : 'm',
    			nextTrack : 'n',
    			prevTrack: 'b',
                help: 'h',
                listen: 'v'
    		}
		}, options);

		self.action = function(action){
		    var audio = $('.' + parentSelector + ' .fandango-player').children('audio')[0];
			switch(action){
				case 'play':
					if(audio !== undefined && !audio.paused && audio.duration > 0){
						//audio is playing, pause it
						audio.pause();
						$('.' + parentSelector + ' .fandango-player .fandango-player-controls').children('.' + parentSelector + ' .icon-play, .' + parentSelector + ' .icon-pause, .' + parentSelector + ' .icon-stop').removeClass('active').attr('aria-pressed','false');
						var button = $('.' + parentSelector + ' .fandango-player .fandango-player-controls').children('.icon-play');
						button.addClass('icon-pause').addClass('active').attr('aria-pressed', 'true').removeClass('icon-play');
						button.attr('title', i18n.t('playerButtons.pause'));
						$('.' + parentSelector + ' .fandango-status').html(i18n.t('status.pause'));
					}
					else {
						//audio is paused, start playing
						audio.play();
						$('.' + parentSelector + ' .fandango-player .fandango-player-controls').children('.' + parentSelector + ' .icon-play, .' + parentSelector + ' .icon-pause, .' + parentSelector + ' .icon-stop').removeClass('active').attr('aria-pressed','false');
						if($('.' + parentSelector + ' .fandango-player .fandango-player-controls').children('.icon-play').length > 0){
							//init play press
							var button = $('.' + parentSelector + ' .fandango-player .fandango-player-controls').children('.icon-play');
							button.addClass('active').attr('aria-pressed', 'true');
							button.attr('title', i18n.t('playerButtons.play'));
						}
						else{
							var button = $('.' + parentSelector + ' .fandango-player .fandango-player-controls').children('.icon-pause');
							button.addClass('icon-play').addClass('active').attr('aria-pressed', 'true').removeClass('icon-pause');
							button.attr('title', i18n.t('playerButtons.play'));
						}
						$('.' + parentSelector + ' .fandango-status').html(i18n.t('status.play'));
							
					}
					break;
				case 'stop': 
					audio.pause();
					audio.currentTime = 0;
					$('.' + parentSelector + ' .fandango-player .fandango-player-controls').children('.icon.active').removeClass('active').attr('aria-pressed', 'false');
					$('.' + parentSelector + ' .fandango-player .fandango-player-controls').children('.icon-stop').addClass('active').attr('aria-pressed', 'true');
					$('.' + parentSelector + ' .fandango-status').html(i18n.t('status.stop'));
					break;
				case 'forward':
					audio.currentTime+=settings.skipSeconds;
					$('.' + parentSelector + ' .icon-forward').addClass('icon-hover').removeClass('icon-hover');
					break;
				case 'rewind': 
					audio.currentTime-=settings.skipSeconds;
					$('.' + parentSelector + ' .icon-backward').addClass('icon-hover').removeClass('icon-hover');
					break;
				case 'volumeUp': 
					if(audio.volume < 1.0)
						audio.volume+=0.1;
					audio.muted = false;
					$('.' + parentSelector + ' .icon-volume-up').addClass('icon-hover').removeClass('icon-hover');
					break;
				case 'volumeDown': 
					if(audio.volume > 0)
						audio.volume-=0.1;
					audio.muted = false;
					$('.' + parentSelector + ' .icon-volume-down').addClass('icon-hover').removeClass('icon-hover');
					break;
				case 'mute': 
					if(audio.muted) $('.' + parentSelector + ' .icon-volume-off').removeClass('mute-active').attr('aria-pressed','false');
					else $('.' + parentSelector + ' .icon-volume-off').addClass('mute-active').attr('aria-pressed', 'true');
					audio.muted = !audio.muted;
					if(audio.muted){
						$('.' + parentSelector + ' .fandango-status').html(i18n.t('status.mute'));
					}
					else{
						if(audio.paused){
							$('.' + parentSelector + ' .fandango-status').html(i18n.t('status.pause'));
						}
						else if(!audio.playing && audio.currentTime > 0){
							$('.' + parentSelector + ' .fandango-status').html(i18n.t('status.play'));
						}
						else $('.' + parentSelector + ' .fandango-status').html(i18n.t('status.stop'));
					}
					break;
				case 'nextTrack':
					if(meta.source.length === 1) break;
				    $('.' + parentSelector + ' .icon-fast-forward').addClass('icon-hover').removeClass('icon-hover');
				    var ol = $('.' + parentSelector + ' .fandango-playlist' + ' ol.tracks');
				    var active = $(ol.children('li.active')[0]);
				    var pos = parseInt(active.attr('data-pos'));
				    var nextPos = 0;
                    if (pos < (meta.source.length - 1)) {
                        nextPos = pos + 1;
                    }
                    active.removeClass('active');
                    var nextTrack = $(ol.children('li[data-pos=' + nextPos + ']')[0]);
                    var nextLink = nextTrack.attr('data-source');
                    
                    nextTrack.addClass('active');

				    changeSource(nextLink);
				    createTranscriptionInformation(meta.vttSource[nextPos]);
					break;
				case 'prevTrack': 
				    $('.' + parentSelector + ' .icon-fast-backward').addClass('icon-hover').removeClass('icon-hover');
				    var ol = $('.fandango-playlist' + ' ol.tracks');
				    var active = $(ol.children('li.active')[0]);
				    var pos = parseInt(active.attr('data-pos'));
				    var prevPos = pos - 1;
				    if (pos == 0) {
				        prevPos = meta.source.length - 1;
				    }
				    active.removeClass('active');
				    var prevTrack = $(ol.children('li[data-pos=' + prevPos + ']')[0]);
				    var prevLink = prevTrack.attr('data-source');

				    prevTrack.addClass('active');
				    changeSource(prevLink);
				    createTranscriptionInformation(meta.vttSource[prevPos]);
				    break;
                case 'help':
                    $('.' + parentSelector + '-fandango-help').modal(); break;
                case 'listen':
                	if(annyang){
                		if(isListening){
	                		annyang.stop();
	                		$('.' + parentSelector + ' .icon-microphone').removeClass('microphone-active');
	                		isListening = false;
	                	}
	                	else{
	                		annyang.start();
	                		$('.' + parentSelector + ' .icon-microphone').addClass('microphone-active');
	                		isListening = true;
	                	}	
                	}
                	break;
				case 'reload': generatePlayer(); break;
			}
		};

		var initSpeechRecognition = function(){
			// Quick and dirty fix to avoid console error 
			if(settings.webAudio){
				if(annyang){
					var commands = {};
					commands[i18n.t('audioCommands.play')] = function(){self.action('play')};
					commands[i18n.t('audioCommands.pause')] = function(){self.action('pause')};
					commands[i18n.t('audioCommands.stop')] = function(){self.action('stop')};
					commands[i18n.t('audioCommands.prevTrack')] = function(){self.action('prevTrack')};
					commands[i18n.t('audioCommands.nextTrack')] = function(){self.action('nextTrack')};
					commands[i18n.t('audioCommands.rewind')] = function(){self.action('rewind')};
					commands[i18n.t('audioCommands.forward')] = function(){self.action('forward')};
					commands[i18n.t('audioCommands.volumeUp')] = function(){self.action('volumeUp')};
					commands[i18n.t('audioCommands.volumeDown')] = function(){self.action('volumeDown')};
					commands[i18n.t('audioCommands.mute')] = function(){self.action('mute')};
					commands[i18n.t('audioCommands.help')] = function(){self.action('help')};
					commands[i18n.t('audioCommands.listen')] = function(){self.action('listen')};
					annyang.addCommands(commands);
				}
			}
		};

		var changeSource = function (source) {
		    var nativeAudioElem = $('.' + parentSelector + ' .fandango-player').children('audio')[0];
		    var audio = $(nativeAudioElem);
		    var currSource = $(audio.children('source')[0]).attr('src');

		    var state = '';
		    if(audio !== null && audio.paused)
		    	state = 'paused';
		    else if(audio !== null && !audio.paused && audio.currentTime > 0)
		    	state = 'playing';
		    else
		    	state = 'stopped';


		    if(source === currSource){
		    	//same track is clicked, if is playing pause it, if is paused play it...
		    	self.action('play');
		    	return;
		    }

		    audio.children('source').remove();
		    var sources = $('<source type="audio/mpeg">').attr('src', source);
		    audio.append(sources);
		    nativeAudioElem.load();
		    self.action('play');
		    // if (isPlaying) nativeAudioElem.play();
		};

	    var openHelpModal = function() {
	        var modalDOM = 
	        	'<div class="' + parentSelector + '-fandango-help modal fade" role="dialog" aria-labeledby="Help" aria-hidden="true" tabindex="-1">' +
	        		'<div class="modal-dialog">' +
						'<div class="modal-content">' +
							'<div class="modal-header">' +
								'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
								'<h4 class="modal-title">' + i18n.t('modal.needHelp') + '</h4>' +
							'</div>' +
							'<div class="modal-body">' +
							i18n.t('modal.description') + '<br />';
							$.each(settings.shortcuts, function(key, shortcut){
								modalDOM += '<span><strong>' + i18n.t('playerButtons.' + key) + ': ' + shortcut + '</strong></span><br />';
							});
							modalDOM+='</div>' +
							'<div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div>' +
						'</div>' +
					'</div>' +
				'</div>';
	        $('body').append(modalDOM);
	    };

		var controlClick = function(e){
			var ctrl = $(this).attr('data-control');

			if(ctrl === 'play'){
				var nativeAudioElem = $('.' + parentSelector + ' .fandango-player').children('audio')[0];
				var audio = $(nativeAudioElem);
			    var currSource = $(audio.children('source')[0]).attr('src');

				var ol = $('.' + parentSelector + ' .fandango-playlist' + ' ol.tracks');
				var li = ol.children("li[data-source='" + currSource + "']")[0];
				li = $(li);
				if(!li.hasClass('active'))
					li.addClass('active');
			}

			self.action(ctrl);
		};

		var updateTime = function(){
			var au = $('.' + parentSelector + ' .fandango-player').children('audio')[0];

			var progressTime = $('.' + parentSelector + ' .fandango-progresstime');
			var currentTime = au.currentTime;
			var duration = au.duration;

			var ctMinutes = Math.floor(parseInt(currentTime / 60));
			var ctSeconds = parseInt(currentTime) - ctMinutes*60;
			var ctTime = (ctMinutes < 10 ? "0" + ctMinutes : ctMinutes) + ":" + (ctSeconds  < 10 ? "0" + ctSeconds : ctSeconds);

			var dMinutes = Math.floor(parseInt(duration / 60));
			var dSeconds = parseInt(duration) -dMinutes*60;
			var dTime = dMinutes + ':' + dSeconds;
			var dTime = (dMinutes < 10 ? "0" + dMinutes : dMinutes) + ":" + (dSeconds  < 10 ? "0" + dSeconds : dSeconds);

			progressTime.text(ctTime + ' / ' + dTime);

			slider.slider('value', currentTime);

			$(slider.children('a')[0]).attr('aria-valuenow', currentTime);
			
			updateTranscriptHighlight(au.currentTime);
		};

		var trackEndedEvent = function(){
			self.action('nextTrack');
		};

		var audioLoadedMetadata = function(){
			var au = $('.' + parentSelector + ' .fandango-player').children('audio')[0];
			var progressTime = $('.' + parentSelector + ' .fandango-progresstime');
			var currentTime = au.currentTime;
			var duration = au.duration;

			var ctMinutes = parseInt(currentTime / 60);
			var ctSeconds = currentTime % 60;
			var ctTime = (ctMinutes < 10 ? "0" + ctMinutes : ctMinutes) + ":" + (ctSeconds  < 10 ? "0" + ctSeconds : ctSeconds);

			var dMinutes = parseInt(duration / 60);
			var dSeconds = parseInt(duration % 60);
			var dTime = dMinutes + ':' + dSeconds;
			var dTime = (dMinutes < 10 ? "0" + dMinutes : dMinutes) + ":" + (dSeconds  < 10 ? "0" + dSeconds : dSeconds);

			var progressBar = $('.' + parentSelector + ' .fandango-progressbar-slider');
			
			slider = $(progressBar).slider({
				min: 0,
				max: duration,
				slide: seekChange
			});

			var sliderButton = slider.children('a')[0];

			$(sliderButton).attr('role', 'slider').attr('tabindex',0).attr('aria-valuenow',0).attr('aria-valuemin',0).attr('aria-valuemax', duration);

			progressTime.text(ctTime + ' / ' + dTime);
		};

		var seekChange = function(ev, ui){
			var time = ui.value;
			var au = $('.' + parentSelector + ' .fandango-player').children('audio')[0];
			au.currentTime = time;
			updateTime();
		};

		var updateTranscriptHighlight = function(time){
			var cues = [];
			var checkbox = $('.' + parentSelector + ' .fandango-transcript-autoscroll-control');
			if(settings.vtt === 1){
				// novel
				var cues = $('.' + parentSelector + ' .fandango-transcript').find('span');
			}
			else if(settings.vtt === 2){
				// poertry
				var cues = $('.' + parentSelector + ' .fandango-transcript').find('span');
			}
			
			$.each(cues, function(ix, elem){
				var el = $(elem);
				var start = parseFloat(el.attr('data-start'));
				var end = parseFloat(el.attr('data-end'));
				if(time>start && time< end){
					cues.removeClass('active');
					el.addClass('active');
					if(checkbox.is(':checked')){
						$('.' + parentSelector + ' .fandango-transcript').scrollTo(el);
					}
				}
			});
		};

		var createAudioPlayer = function () {
			var audioContainer = $('.' + parentSelector + ' .fandango-player');
		    var audio = $('<audio preload="metadata" class="audio"></audio>');
			var sources = $('<source type="audio/mpeg">').attr('src', meta.source[0]);
			audioContainer.append(audio);
			audio.append(sources);
			var nativeAudioElem = audioContainer.children('audio')[0];
			nativeAudioElem.load();
			$(nativeAudioElem).on('timeupdate', updateTime);
			$(nativeAudioElem).on('ended', trackEndedEvent);
			$(nativeAudioElem).on('loadedmetadata', audioLoadedMetadata);
			createTranscriptionInformation(meta.vttSource[0]);
		};

		var createAudioControls = function(){
			var audioContainer = $('.' + parentSelector + ' .fandango-player');
			audioContainer.append($('<div class="' + parentSelector + ' fandango-player-controls fandango-left-controls pull-left col-md-6 col-sm-6 col-xs-6"></div>'));
			audioContainer.append($('<div class="' + parentSelector + ' fandango-player-controls fandango-right-controls pull-right col-md-6 col-sm-6 col-xs-6"></div>'));
			$.each(icons, function(i,e){
				if(e.label !== 'pause'){
					if(e.label === 'microphone'){
						if(settings.webAudio === true && annyang){
							var elem = '<button aria-pressed="false" data-i18n="[aria-label]playerButtons.' + controls[i] +'" type="button" tabindex="0" class="' + parentSelector + ' icon icon-' + e.label + '" data-control="' + controls[i] + '"><span aria-hidden="true"></span></button>';
							if(e.position === 'left')
								var icon = $(elem).click(controlClick).appendTo('.'+parentSelector + ' .fandango-left-controls');
							else
								var icon = $(elem).click(controlClick).appendTo('.'+parentSelector + ' .fandango-right-controls');
						}
					}
					else if(e.label === 'question-sign'){
						var elem = '<button data-toggle="modal" data-target="' + parentSelector + '-fandango-help" aria-pressed="false" data-i18n="[aria-label]playerButtons.' + controls[i] +'" type="button" tabindex="0" class="' + parentSelector + ' icon icon-' + e.label + '" data-control="' + controls[i] + '"><span aria-hidden="true"></span></button>';
						if(e.position === 'left')
							var icon = $(elem).click(controlClick).appendTo('.'+parentSelector + ' .fandango-left-controls');
						else
							var icon = $(elem).click(controlClick).appendTo('.'+parentSelector +' .fandango-right-controls');
					}
					else{
						var elem = '<button aria-pressed="false" data-i18n="[aria-label]playerButtons.' + controls[i] +'" type="button" tabindex="0" class="' + parentSelector + ' icon icon-' + e.label + '" data-control="' + controls[i] + '"><span aria-hidden="true"></span></button>';
						if(e.position === 'left')
							var icon = $(elem).click(controlClick).appendTo('.'+parentSelector + ' .fandango-left-controls');
						else
							var icon = $(elem).click(controlClick).appendTo('.'+parentSelector +' .fandango-right-controls');
					}
				}
			});
			$(parentSelector + ' .icon-fast-backward, .' + parentSelector + ' .icon-fast-forward, .' + parentSelector + ' .icon-backward, .' + parentSelector + ' .icon-forward, .' + parentSelector + ' .icon-volume-up, .' + parentSelector + ' .icon-volume-down, .' + parentSelector + ' .icon-volume-off')
				.hover(function(){
					$(this).addClass('icon-hover');
				}, function(){
					$(this).removeClass('icon-hover');
				});

			//create progress bar
			if(!settings.progressContainer) return;
			$('.'+parentSelector + ' .fandango-progress').append('<div class="' + parentSelector + ' col-md-9 col-sm-9 col-xs-9 pull-left fandango-progressbar"></div>').append('<div class="' + parentSelector + ' col-md-2 col-sm-2 col-xs-2 fandango-progresstime" role="presentation"></div>');
			//progressContainer.append(row);
			var progressBar = $('.'+parentSelector + ' .fandango-progressbar');
			var range = $('<div class="' + parentSelector + ' fandango-progressbar-slider"></div>');
			progressBar.append(range);
		};

		var createBookCover = function(){
			//get image url from dublin core
			if(!settings.coverContainer) return;
			var img = $('<img class="img-responsive" title="' + meta.title + ' | ' + meta.author + '" alt="' + meta.title + ' | ' + meta.author + '" itemprop="image" src="' + settings.imgUrl + '" />');
			$('.'+parentSelector +' .fandango-cover').append(img);
		};

		var createDescriptionInformation = function() {
			if(!settings.descriptionContainer) return;
			if(settings.microdata == 0){
				//if 0 don't display microdata, just display information about source				
				if(meta.title !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.title"></strong> ' + meta.title + '</p>');
				}
				if(meta.altTitle !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.altTitle"></strong> ' + meta.altTitle + '</p>');
				}
				if(meta.author !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.author"></strong> ' + meta.author.join(', ') + '</p>');
				}
				if(meta.publisher !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.publisher"></strong> ' + meta.publisher + '</p>');
				}
				if(meta.narrator !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.narrator"></strong> ' + meta.narrator + '</p>');
				}
				if(meta.issued !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.dateIssued"></strong> ' + meta.issued + '</p>');
				}
				if(meta.isbn !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.isbn"></strong> ' + meta.isbn + '</p>');
				}
			}
			else if(settings.microdata === 1){
				//microdata for audio book, settings value 1
				$('.' + parentSelector + ' .fandango-description').attr({itemscope: '', itemtype: 'http://schema.org/AudioBook'});

				if(meta.title !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.title"></strong><span itemprop="title"> ' + meta.title + '</span></p>');
				}
				if(meta.altTitle !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.altTitle"></strong><span itemprop="alternativeHeadline"> ' + meta.altTitle + '</span></p>');
				}
				if(meta.author !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.author"></strong><span itemprop="author"> ' + meta.author.join(', ') + '</span></p>');
				}
				if(meta.publisher !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.publisher"></strong><span itemprop="publisher"> ' + meta.publisher + '</span></p>');
				}
				if(meta.narrator !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.narrator"></strong><span itemprop="readBy"> ' + meta.narrator + '</span></p>');
				}
				if(meta.issued !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.dateIssued"></strong><span itemprop="datePublished"> ' + meta.issued + '</span></p>');
				}
				if(meta.isbn !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.isbn"></strong><span itemprop="isbn"> ' + meta.isbn + '</span></p>');
				}
			}
			else if(settings.microdata === 2){
				//microdata for music album, settings value 2
				$('.' + parentSelector + ' .fandango-description').attr({itemscope: '', itemtype: 'http://schema.org/MusicAlbum'});

				if(meta.title !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.title"></strong><span itemprop="name"> ' + meta.title + '</span></p>');
				}
				if(meta.author !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.artist"></strong><span itemprop="byartist"> ' + meta.author.join(', ') + '</span></p>');
				}
				if(meta.publisher !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.publisher"></strong><span itemprop="publisher"> ' + meta.publisher + '</span></p>');
				}
				if(meta.issued !== ''){
					$('.' + parentSelector + ' .fandango-description').append('<p><strong data-i18n="description.dateIssued"></strong><span itemprop="datePublished"> ' + meta.issued + '</span></p>');
				}
			}
			else{
				//invalid value, hide the description container
				$('.' + parentSelector + ' .fandango-description').hide();
			}    
		};

		var createTranscriptionInformation = function(source){
			var leftPanel = $('.fandango-left-panel');
			var rightPanel = $('.' + parentSelector + ' .fandango-transcript');
			rightPanel.css('height', leftPanel.height() - 30);
			if(!settings.transcriptContainer) return;
			$.ajax({url: source}).success(function(data){
                var parser = new WebVTT.Parser(window, WebVTT.StringDecoder());
                var cues = [];
                parser.oncue = function(cue){
                    cues.push(cue);
                };
                parser.parse(data);
                parser.flush();
                $('.' + parentSelector + ' .fandango-transcript').empty().addClass('hand');
                if(settings.vtt === 1){
					//show novel vtt
					$.each(cues, function(ix, cue){
						$('.' + parentSelector + ' .fandango-transcript').append('<span data-start="' + cue.startTime + '" data-end="' + cue.endTime + '">' + cue.text + '</span>&nbsp;');
					});
				}
				else if(settings.vtt === 2){
					//show poetry vtt
					$.each(cues, function(ix, cue){
						$('.' + parentSelector + ' .fandango-transcript').append('<span data-start="' + cue.startTime + '" data-end="' + cue.endTime + '">' + cue.text + '</span><br />');
					});
				}
				else{
					$('.' + parentSelector + ' .fandango-transcript').append('Error with vtt settings');
					console.log('VTT setting not in correct format. Must be number 0,1,2 (hidden, poetry, novel)');
				}
				$('.' + parentSelector + ' .fandango-transcript').find('span').unbind('click').click(function(){
					var audio = $('.fandango-player').children('audio')[0];
					if(audio !== null || audio !== undefined){
						audio.currentTime = parseFloat($(this).attr('data-start'));
					}
				});

            }).error(function(){
            	$('.' + parentSelector + ' .fandango-transcript').hide();
            });
		};

		var createChapterPlaylist = function(){
			if(!settings.trackContainer) return;
		    var trackContainer = $('.' + parentSelector + ' .fandango-playlist');
		    var list = '';
		    if(settings.microdata === 1 || settings.microdata === 2){
		    	list = $('<ol class="' + parentSelector + ' tracks" itemscope itemtype="http://schema.org/ItemList"><meta itemprop="name" content="' + meta.title + '" /><meta itemprop="author" content="' + meta.author.join(', ') + '" /><meta itemprop="itemListOrder" content="http://schema.org/ItemListOrderAscending" /></ol>');	
		    }
		    else{
		    	list = $('<ol class="' + parentSelector + ' tracks"></ol>');
		    }
		    
		    trackContainer.append(list);
		    $.each(meta.source, function (index, source) {
		    	var li = '';
		    	if(settings.microdata === 1 || settings.microdata === 2){
		    		li = $('<li tabindex="0" data-pos="' + index +'" data-source="' + source + '"><span itemprop="itemListElement">' + meta.toc[index] + '</li>');
			    }
			    else{
			    	li = $('<li tabindex="0" data-pos="' + index +'" data-source="' + source + '">' + meta.toc[index] + '</li>');
			    }
                li.click(function(){
				    changeSource(source);
				    createTranscriptionInformation(source.replace('mp3', 'vtt'));
				    var ol = $('.' + parentSelector + ' .fandango-playlist' + ' ol.tracks');
				    var active = $(ol.children('li.active')[0]);
				    active.removeClass('active');
				    li.addClass('active');
                });
		        list.append(li);
		    });
		};

		var bindShortcuts = function(){
			$.each(settings.shortcuts, function(command, shortcut){
				$(document).bind('keyup', shortcut.trim(), function(){ self.action(command); return false; })
					.bind('keyup', 'shift+' + shortcut.trim(), function(){ self.action(command); return false; })
					.bind('keyup', 'alt+' + shortcut.trim(), function(){ self.action(command); return false; });
			});
		};

		var readMetadata = function(data){
			$.each(data.dcvalue, function(ix, elem){
				if(elem.element === 'title' && elem.qualifier === 'none') meta.title = elem.text;
				else if(elem.element === 'title' && elem.qualifier === 'alternative') meta.altTitle = elem.text;
				else if(elem.element === 'contributor' && elem.qualifier === 'author') meta.author.push(elem.text);
				else if(elem.element === 'contributor' && elem.qualifier === 'narrator') meta.narrator = elem.text;
				else if(elem.element === 'publisher' && elem.qualifier === 'none') meta.publisher = elem.text;
				else if(elem.element === 'identifier' && elem.qualifier === 'uri') meta.uri = elem.text;
				else if(elem.element === 'date' && elem.qualifier === 'issued') meta.issued = elem.text;
				else if(elem.element === 'description' && elem.qualifier === 'tableofcontents') meta.toc = elem.text.split(';');
				else if(elem.element === 'identifier' && elem.qualifier === 'isbn') meta.isbn = elem.text;
				else if(elem.element === 'description' && elem.qualifier === 'none') meta.description = elem.text;
				else if(elem.element === 'subject' && elem.qualifier === 'none') meta.subject = elem.text;
				else if(elem.element === 'subject' && elem.qualifier === 'keyword') meta.keyword = elem.text;

				$.each(meta.toc, function(ix, elem){
					if((ix+1).toString().length === 1){
						meta.source[ix] = settings.dataUrl + "00" + (ix+1).toString() + '.mp3';
						meta.vttSource[ix] = settings.dataUrl + "00" + (ix+1).toString() + '.vtt';
					}
					else if((ix+1).toString().length === 2){
						meta.source[ix] = settings.dataUrl + "0" + (ix+1).toString() + '.mp3';
						meta.vttSource[ix] = settings.dataUrl + "0" + (ix+1).toString() + '.vtt';	
					}
					else if((ix+1).toString().length === 3){
						meta.source[ix] = settings.dataUrl  + (ix+1).toString() + '.mp3';
						meta.vttSource[ix] = settings.dataUrl  + (ix+1).toString() + '.vtt';	
					}
				});
			});
		};

		var createHeadData = function(){
			if(!settings.headMicrodata) return;
			var title = $(document).find('title');
			if(title.length === 0){
				//no title tag found, create one
				$('<title> ' + meta.title + ' | ' + meta.author.join(', ') + '</title>').appendTo('head');
			}
			else{
				title.text(meta.title + ' | ' + meta.author.join(', '));
			}

			var cannonical = $(document).find('link[rel=cannonical]');
			if(cannonical.length === 0){
				$('<link rel="canonical" href="' + meta.uri + '" />').appendTo('head');
			}
			else{
				cannonical.attr('href', meta.uri);
			}

			var description = $(document).find('meta[name=description]');
			if(description.length === 0){
				$('<meta name="description" content="' + meta.description + '"></meta>').appendTo('head');
			}
			else{
				description.attr('content', meta.description);
			}

			var keywords = $(document).find('meta[name=keywords]');
			if(keywords.length === 0){
				$('<meta name="keywords" content="' + meta.subject + ', ' + meta.keyword + '"></meta>').appendTo('head');
			}
			else{
				keywords.attr('content', meta.subject + ', ' + meta.keyword);
			}
		};

		var createContainers = function(){
			var r = $('<div class="row"></div>');
			var leftContainer = $('<div class="' + parentSelector + ' fandango-left-panel col-md-8 col-sm-12"></div>');
			var rightContainer = $('<div class="' + parentSelector + ' fandango-right-panel col-md-4 col-sm-12"></div>');
			
			if(settings.transcriptContainer){
			var $elem = $('<div class="' + parentSelector + ' col-md-12 col-sm-12 fandango-transcript-container"><div class="' + parentSelector + ' fandango-transcript-autoscroll"><input class="' + parentSelector + ' fandango-transcript-autoscroll-control" type="checkbox" unchecked/>Enable auto-scroll</div><div class="' + parentSelector + ' fandango-transcript"></div></div>');
				rightContainer.append($elem);
			}
			//generate bootstrap row for cover and description
			// if(settings.coverContainer || settings.descriptionContainer){
				if(settings.coverContainer && settings.descriptionContainer){
				var $row = $('<div class="row"></div>');
				if(settings.coverContainer){
					var $elem = $('<div class="' + parentSelector + ' col-md-4 col-sm-4 col-xs-4 fandango-cover"></div>');
					$row.append($elem);
				}

				if(settings.descriptionContainer){
					var $elem = $('<div class="' + parentSelector + ' col-md-8 col-sm-8 col-xs-8 fandango-description"></div>');
					$row.append($elem);
				}

				leftContainer.append($row);
				leftContainer.append($('<br />'));
			}
			else if(!settings.coverContainer && settings.descriptionContainer){
				var $row = $('<div class="row"></div>');
				var $elem = $('<div class="' + parentSelector + ' col-md-12 col-sm-12 col-xs-12 fandango-description" style="float:left"></div>');
				$row.append($elem);	

				leftContainer.append($row);
				leftContainer.append($('<br />'));			
			}
			else if(settings.coverContainer && !settings.descriptionContainer){
				var $row = $('<div class="row"></div>');
				var $elem = $('<div class="' + parentSelector + ' col-md-12 col-sm-12 col-xs-12 fandango-cover"></div>');
				$row.append($elem);	

				leftContainer.append($row);
				leftContainer.append($('<br />'));			
			}
			else {			
			}

			//generate row for status and progress bars
			if(settings.statusContainer && settings.progressContainer){
				//generate row with progress and status containers above the buttons, then generate the buttons container
				var parent = $('<div class="row"></div>');
				var row = $('<div class="col-md-12"></div>');
				parent.append(row);
				var rowAbove = $('<div class="' + parentSelector + ' col-md-12 col-sm-12 fandango-progress"></div>').append($('<div aria-role="alert" class="' + parentSelector + ' col-md-1 col-sm-1 col-xs-1 pull-right fandango-status"><span data-i18n="status.ready"></span></div>'));
				var rowBelow = $('<div class="row"></div>').append($('<div class="' + parentSelector + ' col-md-12 col-sm-12 col-xs-12 fandango-player"></div>'));
				rowAbove.appendTo(row);
				rowBelow.appendTo(row);
				parent.appendTo(leftContainer);
			}
			else if(settings.statusContainer && !settings.progressContainer){
				//generate row with status containers above the buttons, then generate the buttons container
				var parent = $('<div class="row"></div>');
				var row = $('<div class="col-md-12"></div>');
				parent.append(row);
				var rowAbove = $('<div class="row"></div>').appendTo($('<div class="row"></div>')).append($('<div aria-role="alert" class="' + parentSelector + ' col-md-2 pull-right fandango-status"><span data-i18n="status.ready"></span></div>'));
				var rowBelow = $('<div class="row"></div>').append($('<div class="' + parentSelector + ' col-md-12 col-sm-12 col-xs-12 fandango-player"></div>'));
				rowAbove.appendTo(row);
				rowBelow.appendTo(row);
				parent.appendTo(leftContainer);
			}
			else if(!settings.statusContainer && settings.progressContainer){
				//generate row with progress containers above the buttons, then generate the buttons container
				var parent = $('<div class="row"></div>');
				var row = $('<div class="col-md-12"></div>');
				parent.append(row);
				var rowAbove = $('<div class="row"></div>').appendTo($('<div class="row"></div>')).append($('<div class="' + parentSelector + ' col-md-12 fandango-progress"></div>'));
				var rowBelow = $('<div class="row"></div>').append($('<div class="' + parentSelector + ' col-md-12 col-sm-12 col-xs-12 fandango-player"></div>'));
				rowAbove.appendTo(row);
				rowBelow.appendTo(row);
				parent.appendTo(leftContainer);
			}
			else {
				//generate only button container
				var parent = $('<div class="row"></div>');
				var row = $('<div class="col-md-12"></div>');
				parent.append(row);
				var rowBelow = $('<div class="row"></div>').append($('<div class="' + parentSelector + ' col-md-12 col-sm-12 col-xs-12 fandango-player"></div>'));
				rowBelow.appendTo(row);
				parent.appendTo(leftContainer);
			}
			//generate row for the playlist
			if(settings.trackContainer){
				$('<div class="row"></div>').append($('<div class="' + parentSelector + ' col-md-12 col-sm-12 col-xs-12 fandango-playlist"></div>')).appendTo(leftContainer);
			}
			r.append(leftContainer);
			r.append(rightContainer);
			self.append(r);
		};

		var checkIfNotSupported = function(){
			var a = document.createElement('audio');
			return !!!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
		};

		var generatePlayer = function(){
			//read the dublin core file
			if(settings.skipDublinCore === true){
				var lng = settings.lang === '' ? window.navigator.language : settings.lang; 
				parentSelector = self.attr('class') + '-' + Math.floor(Math.random() * 100) + 1;
				$.i18n.init({load: 'current', lng: lng, resGetPath:'../translations/__lng__.json', fallbackLng: settings.fallbackLng}, function(){
					if(checkIfNotSupported()){
						$('.player').append('<p class="alert alert-danger"><strong>' + i18n('errors.playerNotSupported') + '</strong></p>');
						return;
					}
					self.empty();
					meta = settings.metadata;
					createContainers();
					createHeadData();
					createAudioControls();	
					createBookCover();
					createDescriptionInformation();
					createChapterPlaylist();
					$('.' + parentSelector + ' .fandango-player').i18n();
					if(settings.descriptionContainer)
						$('.' + parentSelector + ' .fandango-description').i18n();
					openHelpModal();
					initSpeechRecognition();
					createAudioPlayer();
					bindShortcuts();
				});
			} else{
				$.ajax({
					url: settings.dublinCore,
					dataType: 'xml'
				}).success(function(data){
					var lng = settings.lang === '' ? window.navigator.language : settings.lang; 
					parentSelector = self.attr('class') + '-' + Math.floor(Math.random() * 100) + 1;
					$.i18n.init({load: 'current', lng: lng, resGetPath:'../translations/__lng__.json', fallbackLng: settings.fallbackLng}, function(){
						if(checkIfNotSupported()){
							$('.player').append('<p class="alert alert-danger"><strong>' + i18n('errors.playerNotSupported') + '</strong></p>');
							return;
						}
						self.empty();
						readMetadata($.xml2json(data));
						createContainers();
						createHeadData();
						createAudioControls();	
						createBookCover();
						createDescriptionInformation();
						createChapterPlaylist();
						$('.' + parentSelector + ' .fandango-player').i18n();
						$('.' + parentSelector + ' .fandango-status').i18n();
						if(settings.descriptionContainer)
							$('.' + parentSelector + ' .fandango-description').i18n();
						openHelpModal();
						initSpeechRecognition();
						createAudioPlayer();
						bindShortcuts();
					});
					
				});
			}
			
		};

		generatePlayer();

		return this;
	};
}(jQuery));
