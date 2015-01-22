/*
 * jQuery Simple audio stream player
 * Copyright 2014, National and Universit Library "St. Clement of Ohrid" - Skopje, Macedonia
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * 
 * This plugin is dependant on jquey 1.9.1 (for IE compatibility), jquery ui 1.9.1, jquery hotkeys, jquery XML2JSON, Mozilla's vtt 
 *
 */

(function($){
	$.fn.fandango = function(options){
		var self = this;
		
		var slider = null;

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

		window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
		var isListening = false;
		var speechRecognition = null;

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
    		vtt: 0,
    		microdata: 0,
    		dataUrl: '',
    		dublinCore: 'dublin_core.xml',
    		imgUrl : 'thumb.jpg',
    		skipSeconds: 5,
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
		    var audio = $('.fandango-player').children('audio')[0];
			switch(action){
				case 'play':
					if(audio !== undefined && !audio.paused && audio.duration > 0){
						//audio is playing, pause it
						audio.pause();
						$('.fandango-player .fandango-player-controls').children('.icon-play, .icon-pause, .icon-stop').removeClass('active').attr('aria-pressed','false');
						var button = $('.fandango-player .fandango-player-controls').children('.icon-play');
						button.addClass('icon-pause').addClass('active').attr('aria-pressed', 'true').removeClass('icon-play');
						button.attr('title', i18n.t('playerButtons.pause'));
						$('.fandango-status').html('Paused');
					}
					else {
						//audio is paused, start playing
						audio.play();
						$('.fandango-player .fandango-player-controls').children('.icon-play, .icon-pause, .icon-stop').removeClass('active').attr('aria-pressed','false');
						if($('.fandango-player .fandango-player-controls').children('.icon-play').length > 0){
							//init play press
							var button = $('.fandango-player .fandango-player-controls').children('.icon-play');
							button.addClass('active').attr('aria-pressed', 'true');
							button.attr('title', i18n.t('playerButtons.play'));
						}
						else{
							var button = $('.fandango-player .fandango-player-controls').children('.icon-pause');
							button.addClass('icon-play').addClass('active').attr('aria-pressed', 'true').removeClass('icon-pause');
							button.attr('title', i18n.t('playerButtons.play'));
						}
						$('.fandango-status').html('Playing');
							
					}
					break;
				case 'stop': 
					audio.pause();
					audio.currentTime = 0;
					$('.fandango-player .fandango-player-controls').children('.icon.active').removeClass('active').attr('aria-pressed', 'false');
					$('.fandango-player .fandango-player-controls').children('.icon-stop').addClass('active').attr('aria-pressed', 'true');
					$('.fandango-status').html('Stopped');
					break;
				case 'forward':
					audio.currentTime+=settings.skipSeconds;
					$('.icon-forward').addClass('icon-hover').removeClass('icon-hover',500,'linear');
					break;
				case 'rewind': 
					audio.currentTime-=settings.skipSeconds;
					$('.icon-backward').addClass('icon-hover').removeClass('icon-hover',500,'linear');
					break;
				case 'volumeUp': 
					if(audio.volume < 1.0)
						audio.volume+=0.1;
					audio.muted = false;
					$('.icon-volume-up').addClass('icon-hover').removeClass('icon-hover',500,'linear');
					break;
				case 'volumeDown': 
					if(audio.volume > 0)
						audio.volume-=0.1;
					audio.muted = false;
					$('.icon-volume-down').addClass('icon-hover').removeClass('icon-hover',500,'linear');
					break;
				case 'mute': 
					if(audio.muted) $('.icon-volume-off').removeClass('active').attr('aria-pressed','false');
					else $('.icon-volume-off').addClass('active').attr('aria-pressed', 'true');
					audio.muted = !audio.muted;
					if(audio.muted){
						$('.fandango-status').html('Muted');
					}
					else{
						if(audio.paused){
							$('.fandango-status').html('Paused');
						}
						else if(!audio.playing && audio.currentTime > 0){
							$('.fandango-status').html('Playing');
						}
						else $('.fandango-status').html('Stopped');
					}
					break;
				case 'nextTrack':
				    $('.icon-fast-forward').addClass('icon-hover').removeClass('icon-hover', 500, 'linear');
				    var ol = $('.fandango-playlist' + ' ol.tracks');
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

        			// var isPlaying = false;
				    // if (audio !== undefined && !audio.paused && audio.duration > 0) isPlaying = true;
				    changeSource(nextLink, true);
				    createTranscriptionInformation(meta.vttSource[nextPos]);
					break;
				case 'prevTrack': 
				    $('.icon-fast-backward').addClass('icon-hover').removeClass('icon-hover', 500, 'linear');
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
				    // var isPlaying = false;
				    // if (audio !== undefined && !audio.paused && audio.duration > 0) isPlaying = true;
				    changeSource(prevLink, true);
				    createTranscriptionInformation(meta.vttSource[prevPos]);
				    break;
                case 'help':
                    $('.fandango-help').modal(); break;
                case 'listen':
                	if(speechRecognition !== null){
                		if(isListening){
	                		speechRecognition.stop();
	                		$('.icon-microphone').removeClass('microphone-active');
	                		isListening = false;
	                	}
	                	else{
	                		speechRecognition.start();
	                		$('.icon-microphone').addClass('microphone-active');
	                		isListening = true;
	                	}	
                	}
                	break;
				case 'reload': generatePlayer(); break;
			}
		};

		var initSpeechRecognition = function(){
			if(window.SpeechRecognition !== null){
			speechRecognition = new window.SpeechRecognition(); 
			speechRecognition.continuous = true;
			speechRecognition.lang = "en-US";
			speechRecognition.interimResults = true;

			speechRecognition.onresult = function(event){
	          for (var i = event.resultIndex; i < event.results.length; i++) {
	            if (event.results[i].isFinal) {
	            	var text = event.results[i][0].transcript.trim();
	            	var command = '';
	            	console.log(text);
	            	switch(text){
	            		case 'play': command = 'play'; break;
	            		case 'pause': command = 'play'; break;
	            		case 'stop': command = 'stop'; break;
	            		case 'next track': command = 'nextTrack'; break;
	            		case 'previous track': command = 'prevTrack'; break;
	            		case 'back': command = 'rewind'; break;
	            		case 'skip': command = 'forward'; break;
	            		case 'volume up': command = 'volumeUp'; break;
	            		case 'volume down': command = 'volumeDown'; break;
	            		case 'mute': command = 'mute'; break;
	            		case 'unmute': command = 'mute'; break;
	            		default: command = '';
	            	}
	              	self.action(command);
	            }
	          }
			};
			speechRecognition.onend = function(event){
				// speechRecognition.start();
				$('.icon-microphone').removeClass('microphone-active');
        		isListening = false;
			};
		}
		};

		var changeSource = function (source, isPlaying) {
		    var nativeAudioElem = $('.fandango-player').children('audio')[0];
		    var audio = $(nativeAudioElem);
		    audio.children('source').remove();
		    var sources = $('<source type="audio/mpeg">').attr('src', source);
		    audio.append(sources);
		    nativeAudioElem.load();
		    if (isPlaying) nativeAudioElem.play();
		};

	    var openHelpModal = function() {
	        // var modal = $('<div class="help-modal" title="' + i18n.t('modal.needHelp') + '"></div>');
	        // $.each(settings.shortcuts, function(key, shortcut){
	        // 	modal.append('<span><strong>' + i18n.t('playerButtons.' + key) + ': ' + shortcut + '</strong></span><br />');
	        // });
	      //   modal.dialog({
			    //   resizable: false,
			    //   modal: true
			    // });
	        var modalDOM = 
	        	'<div class="fandango-help modal fade" role="dialog" aria-labeledby="Help" aria-hidden="true" tabindex="-1">' +
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
			self.action($(this).attr('data-control'));
		};

		var updateTime = function(){
			var au = $('.fandango-player').children('audio')[0];

			var progressTime = $('.fandango-progresstime');
			var currentTime = au.currentTime;
			var duration = au.duration;

			// var ctMinutes = parseInt(currentTime / 60) % 60;
			// var ctSeconds = parseInt(currentTime % 60);
			var ctMinutes = Math.floor(parseInt(currentTime / 60));
			var ctSeconds = parseInt(currentTime) - ctMinutes*60;
			var ctTime = (ctMinutes < 10 ? "0" + ctMinutes : ctMinutes) + ":" + (ctSeconds  < 10 ? "0" + ctSeconds : ctSeconds);

			// var dMinutes = parseInt(duration / 60) % 60;
			// var dSeconds = parseInt(duration % 60);
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
			// self.action('play');
		};

		var audioLoadedMetadata = function(){
			var au = $('.fandango-player').children('audio')[0];
			var progressTime = $('.fandango-progresstime');
			var currentTime = au.currentTime;
			var duration = au.duration;

			var ctMinutes = parseInt(currentTime / 60);
			var ctSeconds = currentTime % 60;
			var ctTime = (ctMinutes < 10 ? "0" + ctMinutes : ctMinutes) + ":" + (ctSeconds  < 10 ? "0" + ctSeconds : ctSeconds);

			var dMinutes = parseInt(duration / 60);
			var dSeconds = parseInt(duration % 60);
			var dTime = dMinutes + ':' + dSeconds;
			var dTime = (dMinutes < 10 ? "0" + dMinutes : dMinutes) + ":" + (dSeconds  < 10 ? "0" + dSeconds : dSeconds);

			var progressBar = $('.fandango-progressbar-slider');
			
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
			var au = $('.fandango-player').children('audio')[0];
			au.currentTime = time;
			updateTime();
		};

		var updateTranscriptHighlight = function(time){
			var cues = [];
			var checkbox = $('.fandango-transcrip-autoscroll-control');

			// var scroll_top = $('.fandango-transcript').scrollTop();
			if(settings.vtt === 1){
				// poetry
				var cues = $('.fandango-transcript').find('span');
			}
			else if(settings.vtt === 2){
				// novel
				var cues = $('.fandango-transcript').find('span');
			}
			
			$.each(cues, function(ix, elem){
				var el = $(elem);
				var start = parseFloat(el.attr('data-start'));
				var end = parseFloat(el.attr('data-end'));
				if(time>start && time< end){
					cues.removeClass('active');
					el.addClass('active');
					// $('.fandango-transcript').scrollTop(el.offset().top + scroll_top);
					
					if(checkbox.is(':checked')){
						$('.fandango-transcript').scrollTo(el);
					}
				}
			});
		};

		var createAudioPlayer = function () {
			var audioContainer = $('.fandango-player');
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
			var audioContainer = $('.fandango-player');
			audioContainer.append($('<div class="fandango-player-controls fandango-left-controls pull-left"></div>'));
			audioContainer.append($('<div class="fandango-player-controls fandango-right-controls pull-right"></div>'));
			$.each(icons, function(i,e){
				if(e.label !== 'pause'){
					if(e.label === 'microphone'){
						if(window.SpeechRecognition !== null){
							var elem = '<button aria-pressed="false" data-i18n="[title]playerButtons.' + controls[i] +'" type="button" tabindex="0" class="icon icon-' + e.label + '" data-control="' + controls[i] + '"></button>';
							if(e.position === 'left')
								var icon = $(elem).click(controlClick).appendTo('.fandango-left-controls');
							else
								var icon = $(elem).click(controlClick).appendTo('.fandango-right-controls');
						}
					}
					else if(e.label === 'question-sign'){
						var elem = '<button data-toggle="modal" data-target="fandango-help" aria-pressed="false" data-i18n="[title]playerButtons.' + controls[i] +'" type="button" tabindex="0" class="icon icon-' + e.label + '" data-control="' + controls[i] + '"></button>';
						if(e.position === 'left')
							var icon = $(elem).click(controlClick).appendTo('.fandango-left-controls');
						else
							var icon = $(elem).click(controlClick).appendTo('.fandango-right-controls');
					}
					else{
						var elem = '<button aria-pressed="false" data-i18n="[title]playerButtons.' + controls[i] +'" type="button" tabindex="0" class="icon icon-' + e.label + '" data-control="' + controls[i] + '"></button>';
						if(e.position === 'left')
							var icon = $(elem).click(controlClick).appendTo('.fandango-left-controls');
						else
							var icon = $(elem).click(controlClick).appendTo('.fandango-right-controls');
					}
				}
			});
			$('.icon-fast-backward, .icon-fast-forward, .icon-backward, .icon-forward, .icon-volume-up, .icon-volume-down, .icon-volume-off')
				.hover(function(){
					$(this).addClass('icon-hover');
				}, function(){
					$(this).removeClass('icon-hover', 500, 'linear');
				});

			//create progress bar
			if(!settings.progressContainer) return;
			var progressContainer = $('.fandango-progress');
			var row = $('<div class="row"></div>');
			row.append('<div class="col-md-10 fandango-progressbar"></div>').append('<div class="col-md-2 fandango-progresstime" role="presentation"></div>');
			progressContainer.append(row);
			var progressBar = $('.fandango-progressbar');
			// var range = $('<input role="progressbar" type="range" value="0" class="fandango-progressbar-slider" />');
			var range = $('<div class="fandango-progressbar-slider"></div>');
			progressBar.append(range);
		};

		var createBookCover = function(){
			//get image url from dublin core
			if(!settings.coverContainer) return;
			var img = $('<img class="img-responsive" title="' + meta.title + ' | ' + meta.author + '" alt="' + meta.title + ' | ' + meta.author + '" itemprop="image" src="' + settings.imgUrl + '" />');
			$('.fandango-cover').append(img);
		};

		var createDescriptionInformation = function() {
			if(!settings.descriptionContainer) return;
			if(settings.microdata == 0){
				//if 0 don't display microdata, just display information about source				
				if(meta.title !== ''){
					$('.fandango-description').append('<p><span data-i18n="description.title"></span> ' + meta.title + '</p>');
				}
				if(meta.altTitle !== ''){
					$('.fandango-description').append('<p><span data-i18n="description.altTitle"></span> ' + meta.altTitle + '</p>');
				}
				if(meta.author !== ''){
					$('.fandango-description').append('<p><span data-i18n="description.author"></span> ' + meta.author.join(', ') + '</p>');
				}
				if(meta.publisher !== ''){
					$('.fandango-description').append('<p><span data-i18n="description.publisher"></span> ' + meta.publisher + '</p>');
				}
				if(meta.narrator !== ''){
					$('.fandango-description').append('<p><span data-i18n="description.narrator"></span> ' + meta.narrator + '</p>');
				}
				if(meta.issued !== ''){
					$('.fandango-description').append('<p><span data-i18n="description.dateIssued"></span> ' + meta.issued + '</p>');
				}
				if(meta.isbn !== ''){
					$('.fandango-description').append('<p><span data-i18n="description.isbn"></span> ' + meta.isbn + '</p>');
				}
			}
			else if(settings.microdata === 1){
				//microdata for audio book, settings value 1
				$('.fandango-description').attr({itemscope: '', itemtype: 'http://schema.org/AudioBook'});

				if(meta.title !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.title"></strong><span itemprop="title"> ' + meta.title + '</span></p>');
				}
				if(meta.altTitle !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.altTitle"></strong><span itemprop="alternativeHeadline"> ' + meta.altTitle + '</span></p>');
				}
				if(meta.author !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.author"></strong><span itemprop="author"> ' + meta.author.join(', ') + '</span></p>');
				}
				if(meta.publisher !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.publisher"></strong><span itemprop="publisher"> ' + meta.publisher + '</span></p>');
				}
				if(meta.narrator !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.narrator"></strong><span itemprop="readBy"> ' + meta.narrator + '</span></p>');
				}
				if(meta.issued !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.dateIssued"></strong><span itemprop="datePublished"> ' + meta.issued + '</span></p>');
				}
				if(meta.isbn !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.isbn"></strong><span itemprop="isbn"> ' + meta.isbn + '</span></p>');
				}
			}
			else if(settings.microdata === 2){
				//microdata for music album, settings value 2
				$('.fandango-description').attr({itemscope: '', itemtype: 'http://schema.org/MusicAlbum'});

				if(meta.title !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.title"></strong><span itemprop="name"> ' + meta.title + '</span></p>');
				}
				if(meta.author !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.artist"></strong><span itemprop="byartist"> ' + meta.author.join(', ') + '</span></p>');
				}
				if(meta.publisher !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.publisher"></strong><span itemprop="publisher"> ' + meta.publisher + '</span></p>');
				}
				if(meta.issued !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.dateIssued"></strong><span itemprop="datePublished"> ' + meta.issued + '</span></p>');
				}
			}
			else{
				//invalid value, hide the description container
				$('.fandango-description').hide();
			}    
		};

		var createTranscriptionInformation = function(source){
			if(!settings.transcriptContainer || settings.microdata !== 1) return;
			$.ajax({url: source}).success(function(data){
                var parser = new WebVTT.Parser(window, WebVTT.StringDecoder());
                var cues = [];
                parser.oncue = function(cue){
                    cues.push(cue);
                };
                parser.parse(data);
                parser.flush();
                $('.fandango-transcript').empty().addClass('hand');
                // if($('.fandango-transcript').css('overflow-y') !== 'scroll') $('.fandango-transcript').css('overflow-y', 'scroll');
                // $('.fandango-transcript').css('height', 0).css('height',$('.fandango-transcript').parent().height());
                if(settings.vtt === 0){
					//hide vtt fields
					$('.fandango-transcript').hide();	
				}
				else if(settings.vtt === 1){
					//show poetry vtt
					$.each(cues, function(ix, cue){
						$('.fandango-transcript').append('<span data-start="' + cue.startTime + '" data-end="' + cue.endTime + '">' + cue.text + '</span><br />');
					});
				}
				else if(settings.vtt === 2){
					//show novel vtt
					$.each(cues, function(ix, cue){
						$('.fandango-transcript').append('<span data-start="' + cue.startTime + '" data-end="' + cue.endTime + '">' + cue.text + '</span>&nbsp;');
					});
				}
				else{
					$('.fandango-transcript').append('Error with vtt settings');
					console.log('VTT setting not in correct format. Must be number 0,1,2 (hidden, poetry, novel)');
				}
				$('.fandango-transcript').find('span').unbind('click').click(function(){
					var audio = $('.fandango-player').children('audio')[0];
					if(audio !== null || audio !== undefined){
						audio.currentTime = parseFloat($(this).attr('data-start'));
					}
				});

            }).error(function(){
            	$('.fandango-transcript').hide();
            });
		};

		var createChapterPlaylist = function(){
			if(!settings.trackContainer) return;
		    var trackContainer = $('.fandango-playlist');
		    var list = '';
		    if(settings.microdata === 1 || settings.microdata === 2){
		    	list = $('<ol class="tracks" itemscope itemtype="http://schema.org/ItemList"><meta itemprop="name" content="' + meta.title + '" /><meta itemprop="author" content="' + meta.author.join(', ') + '" /><meta itemprop="itemListOrder" content="http://schema.org/ItemListOrderAscending" /></ol>');	
		    }
		    else{
		    	list = $('<ol class="tracks"></ol>');
		    }
		    
		    trackContainer.append(list);
		    $.each(meta.source, function (index, source) {
		    	var li = '';
		    	if(settings.microdata === 1 || settings.microdata === 2){
		    		li = $('<li tabindex="0" data-pos="' + index +'" data-source="' + source + '"><span itemprop="itemListElement">' + meta.toc[index] + '</span><span class="pull-right time-display"><small></small></span></li>');
			    }
			    else{
			    	li = $('<li tabindex="0" data-pos="' + index +'" data-source="' + source + '">' + meta.toc[index] + '<span class="pull-right time-display"><small></small></span></li>');
			    }
                li.click(function(){
        //         	var audio = $('.fandango-player').children('audio')[0];
        //         	var isPlaying = false;
				    // if (audio !== undefined && !audio.paused && audio.duration > 0) isPlaying = true;
				    changeSource(source, true);
				    createTranscriptionInformation(source.replace('mp3', 'vtt'));
				    var ol = $('.fandango-playlist' + ' ol.tracks');
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
				// $.each(shortcut.split(','), function(index, key){
				// 	$(document).bind('keyup', key.trim(), function(){ self.action(command); return false; });
				// });
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

			//generate bootstrap row for cover, description and transcript
			if(settings.coverContainer || settings.descriptionContainer || settings.transcriptContainer){
				var $row = $('<div class="row"></div>');
				if(settings.coverContainer){
					var $elem = $('<div class="col-md-4 col-sm-4 col-xs-6 fandango-cover"></div>');
					$row.append($elem);
				}

				if(settings.descriptionContainer){
					var $elem = $('<div class="col-md-4 col-sm-4 col-xs-6 fandango-description"></div>');
					$row.append($elem);
				}

				if(settings.transcriptContainer){
					var $elem = $('<div class="col-md-4 col-sm-4 fandango-transcript-container"><div><input class="fandango-transcrip-autoscroll-control" type="checkbox" checked/>Enable auto-scroll</div><div class="fandango-transcript"></div></div>');
					$row.append($elem);
				}
				self.append($row);
				self.append($('<br />'));
			}

			//generate row for status and progress bars
			if(settings.statusContainer && settings.progressContainer){
				//generate row with progress and status containers above the buttons, then generate the buttons container
				var parent = $('<div class="row"></div>');
				var row = $('<div class="col-md-8"></div>');
				parent.append(row);
				var rowAbove = $('<div class="row"></div>').appendTo($('<div class="row"></div>')).append($('<div class="col-md-11 fandango-progress"></div>')).append($('<div aria-role="alert" class="col-md-1 pull-right fandango-status">Waiting</div>'));
				var rowBelow = $('<div class="row"></div>').append($('<div class="col-md-12 fandango-player"></div>'));
				rowAbove.appendTo(row);
				rowBelow.appendTo(row);
				parent.appendTo(self);
			}
			else if(settings.statusContainer && !settings.progressContainer){
				//generate row with status containers above the buttons, then generate the buttons container
				var parent = $('<div class="row"></div>');
				var row = $('<div class="col-md-8"></div>');
				parent.append(row);
				var rowAbove = $('<div class="row"></div>').appendTo($('<div class="row"></div>')).append($('<div aria-role="alert" class="col-md-2 pull fandango-status">Waiting</div>'));
				var rowBelow = $('<div class="row"></div>').append($('<div class="col-md-12 fandango-player"></div>'));
				rowAbove.appendTo(row);
				rowBelow.appendTo(row);
				parent.appendTo(self);
			}
			else if(!settings.statusContainer && settings.progressContainer){
				//generate row with progress containers above the buttons, then generate the buttons container
				var parent = $('<div class="row"></div>');
				var row = $('<div class="col-md-8"></div>');
				parent.append(row);
				var rowAbove = $('<div class="row"></div>').appendTo($('<div class="row"></div>')).append($('<div class="col-md-8 fandango-progress"></div>'));
				var rowBelow = $('<div class="row"></div>').append($('<div class="col-md-12 fandango-player"></div>'));
				rowAbove.appendTo(row);
				rowBelow.appendTo(row);
				parent.appendTo(self);
			}
			else {
				//generate only button container
				var parent = $('<div class="row"></div>');
				var row = $('<div class="col-md-8"></div>');
				parent.append(row);
				var rowBelow = $('<div class="row"></div>').append($('<div class="col-md-12 fandango-player"></div>'));
				rowBelow.appendTo(row);
				parent.appendTo(self);
			}
			//generate row for the playlist
			if(settings.trackContainer){
				$('<div class="row"></div>').append($('<div class="col-md-8 fandango-playlist"></div>')).appendTo(self);
			}

		};


		var generatePlayer = function(){
			//read the dublin core file
			$.ajax({
				url: settings.dublinCore,
				dataType: 'xml'
			}).success(function(data){
				self.empty();
				initSpeechRecognition();
				readMetadata($.xml2json(data));
				createContainers();
				createHeadData();
				createAudioPlayer();
				createAudioControls();	
				createBookCover();
				createDescriptionInformation();
				createChapterPlaylist();
				bindShortcuts();
				$.i18n.init({load: 'unspecific', lng: window.navigator.language, resGetPath:'../translations/__lng__.json', fallbackLng: "mk"}, function(){
					$('.fandango-player').i18n();
					if(!settings.descriptionContainer) return;
					$('.fandango-description').i18n();
					openHelpModal();
				});
				
			});
		};

		generatePlayer();

		return this;
	};
}(jQuery)); 
