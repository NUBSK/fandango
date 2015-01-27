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
    		headMicrodata: true,
    		lang: '',
    		fallbackLng: 'mk',
    		webAudio: true,
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
						$('.fandango-status').html(i18n.t('status.pause'));
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
						$('.fandango-status').html(i18n.t('status.play'));
							
					}
					break;
				case 'stop': 
					audio.pause();
					audio.currentTime = 0;
					$('.fandango-player .fandango-player-controls').children('.icon.active').removeClass('active').attr('aria-pressed', 'false');
					$('.fandango-player .fandango-player-controls').children('.icon-stop').addClass('active').attr('aria-pressed', 'true');
					$('.fandango-status').html(i18n.t('status.stop'));
					break;
				case 'forward':
					audio.currentTime+=settings.skipSeconds;
					$('.icon-forward').addClass('icon-hover').removeClass('icon-hover');
					break;
				case 'rewind': 
					audio.currentTime-=settings.skipSeconds;
					$('.icon-backward').addClass('icon-hover').removeClass('icon-hover');
					break;
				case 'volumeUp': 
					if(audio.volume < 1.0)
						audio.volume+=0.1;
					audio.muted = false;
					$('.icon-volume-up').addClass('icon-hover').removeClass('icon-hover');
					break;
				case 'volumeDown': 
					if(audio.volume > 0)
						audio.volume-=0.1;
					audio.muted = false;
					$('.icon-volume-down').addClass('icon-hover').removeClass('icon-hover');
					break;
				case 'mute': 
					if(audio.muted) $('.icon-volume-off').removeClass('active').attr('aria-pressed','false');
					else $('.icon-volume-off').addClass('active').attr('aria-pressed', 'true');
					audio.muted = !audio.muted;
					if(audio.muted){
						$('.fandango-status').html(i18n.t('status.mute'));
					}
					else{
						if(audio.paused){
							$('.fandango-status').html(i18n.t('status.pause'));
						}
						else if(!audio.playing && audio.currentTime > 0){
							$('.fandango-status').html(i18n.t('status.play'));
						}
						else $('.fandango-status').html(i18n.t('status.stop'));
					}
					break;
				case 'nextTrack':
					if(meta.source.length === 1) break;
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
                	if(annyang){
                		if(isListening){
	                		annyang.stop();
	                		$('.icon-microphone').removeClass('microphone-active');
	                		isListening = false;
	                	}
	                	else{
	                		annyang.start();
	                		$('.icon-microphone').addClass('microphone-active');
	                		isListening = true;
	                	}	
                	}
                	break;
				case 'reload': generatePlayer(); break;
			}
		};

		var initSpeechRecognition = function(){
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
			var checkbox = $('.fandango-transcript-autoscroll-control');

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
						if(window.SpeechRecognition !== null && settings.webAudio === true){
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
			$('.fandango-progress').append('<div class="col-md-10 col-sm-10 fandango-progressbar"></div>').append('<div class="col-md-2 col-sm-2 fandango-progresstime" role="presentation"></div>');
			//progressContainer.append(row);
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
					$('.fandango-description').append('<p><strong data-i18n="description.title"></strong> ' + meta.title + '</p>');
				}
				if(meta.altTitle !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.altTitle"></strong> ' + meta.altTitle + '</p>');
				}
				if(meta.author !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.author"></strong> ' + meta.author.join(', ') + '</p>');
				}
				if(meta.publisher !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.publisher"></strong> ' + meta.publisher + '</p>');
				}
				if(meta.narrator !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.narrator"></strong> ' + meta.narrator + '</p>');
				}
				if(meta.issued !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.dateIssued"></strong> ' + meta.issued + '</p>');
				}
				if(meta.isbn !== ''){
					$('.fandango-description').append('<p><strong data-i18n="description.isbn"></strong> ' + meta.isbn + '</p>');
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
			var leftPanel = $('.fandango-left-panel');
			var rightPanel = $('.fandango-transcript');
			rightPanel.css('height', leftPanel.height());
			if(!settings.transcriptContainer) return;
			$.ajax({url: source}).success(function(data){
                var parser = new WebVTT.Parser(window, WebVTT.StringDecoder());
                var cues = [];
                parser.oncue = function(cue){
                    cues.push(cue);
                };
                parser.parse(data);
                parser.flush();
                $('.fandango-transcript').empty().addClass('hand');
                if(settings.vtt === 1){
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
			var leftContainer = $('<div class="fandango-left-panel col-md-8 col-sm-12"></div>');
			var rightContainer = $('<div class="fandango-right-panel col-md-4 col-sm-12"></div>');
			
			if(settings.transcriptContainer){
			var $elem = $('<div class="col-md-12 col-sm-12 fandango-transcript-container"><div><input class="fandango-transcript-autoscroll-control" type="checkbox" unchecked/>Enable auto-scroll</div><div class="fandango-transcript"></div></div>');
				rightContainer.append($elem);
			}
			//generate bootstrap row for cover and description
			// if(settings.coverContainer || settings.descriptionContainer){
				if(settings.coverContainer && settings.descriptionContainer){
				var $row = $('<div class="row"></div>');
				if(settings.coverContainer){
					var $elem = $('<div class="col-md-6 col-sm-6 col-xs-6 fandango-cover"></div>');
					$row.append($elem);
				}

				if(settings.descriptionContainer){
					var $elem = $('<div class="col-md-6 col-sm-6 col-xs-6 fandango-description"></div>');
					$row.append($elem);
				}

				leftContainer.append($row);
				leftContainer.append($('<br />'));
			}
			else if(!settings.coverContainer && settings.descriptionContainer){
				var $row = $('<div class="row"></div>');
				var $elem = $('<div class="col-md-12 col-sm-12 col-xs-12 fandango-description"></div>');
				$row.append($elem);	

				leftContainer.append($row);
				leftContainer.append($('<br />'));			
			}
			else if(settings.coverContainer && !settings.descriptionContainer){
				var $row = $('<div class="row"></div>');
				var $elem = $('<div class="col-md-12 col-sm-12 col-xs-12 fandango-cover"></div>');
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
				var rowAbove = $('<div class="row"></div>').append($('<div class="col-md-11 col-sm-11 fandango-progress"></div>')).append($('<div aria-role="alert" class="col-md-1 col-sm-1 pull-right fandango-status"><span data-i18n="status.ready"></span></div>'));
				var rowBelow = $('<div class="row"></div>').append($('<div class="col-md-12 col-sm-12 fandango-player"></div>'));
				rowAbove.appendTo(row);
				rowBelow.appendTo(row);
				parent.appendTo(leftContainer);
			}
			else if(settings.statusContainer && !settings.progressContainer){
				//generate row with status containers above the buttons, then generate the buttons container
				var parent = $('<div class="row"></div>');
				var row = $('<div class="col-md-12"></div>');
				parent.append(row);
				var rowAbove = $('<div class="row"></div>').appendTo($('<div class="row"></div>')).append($('<div aria-role="alert" class="col-md-2 pull-right fandango-status"><span data-i18n="status.ready"></span></div>'));
				var rowBelow = $('<div class="row"></div>').append($('<div class="col-md-12 fandango-player"></div>'));
				rowAbove.appendTo(row);
				rowBelow.appendTo(row);
				parent.appendTo(leftContainer);
			}
			else if(!settings.statusContainer && settings.progressContainer){
				//generate row with progress containers above the buttons, then generate the buttons container
				var parent = $('<div class="row"></div>');
				var row = $('<div class="col-md-12"></div>');
				parent.append(row);
				var rowAbove = $('<div class="row"></div>').appendTo($('<div class="row"></div>')).append($('<div class="col-md-12 fandango-progress"></div>'));
				var rowBelow = $('<div class="row"></div>').append($('<div class="col-md-12 fandango-player"></div>'));
				rowAbove.appendTo(row);
				rowBelow.appendTo(row);
				parent.appendTo(leftContainer);
			}
			else {
				//generate only button container
				var parent = $('<div class="row"></div>');
				var row = $('<div class="col-md-12"></div>');
				parent.append(row);
				var rowBelow = $('<div class="row"></div>').append($('<div class="col-md-12 fandango-player"></div>'));
				rowBelow.appendTo(row);
				parent.appendTo(leftContainer);
			}
			//generate row for the playlist
			if(settings.trackContainer){
				$('<div class="row"></div>').append($('<div class="col-md-12 col-sm-12 fandango-playlist"></div>')).appendTo(leftContainer);
			}
			r.append(leftContainer);
			r.append(rightContainer);
			self.append(r);
		};

		var generatePlayer = function(){
			var a = document.createElement('audio');
			if(!!!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''))){
				$('.player').append('<p class="alert alert-danger"><strong>You are using outdated browser that is no longer supported!</strong></p>');
				return;
			}
			//read the dublin core file
			if(settings.skipDublinCore === true){
				self.empty();
				meta = settings.metadata;
				createContainers();
				createHeadData();
				createAudioControls();	
				createBookCover();
				createDescriptionInformation();
				createChapterPlaylist();
				createAudioPlayer();
				bindShortcuts();
				var lng = settings.lang === '' ? window.navigator.language : settings.lang; 
				$.i18n.init({load: 'unspecific', lng: lng, resGetPath:'../translations/__lng__.json', fallbackLng: settings.fallbackLng}, function(){
					$('.fandango-player').i18n();
					$('.fandango-status').i18n();
					if(!settings.descriptionContainer) return;
					$('.fandango-description').i18n();
					openHelpModal();
					initSpeechRecognition();
				});
			} else{
				$.ajax({
					url: settings.dublinCore,
					dataType: 'xml'
				}).success(function(data){
					self.empty();
					readMetadata($.xml2json(data));
					createContainers();
					createHeadData();
					createAudioControls();	
					createBookCover();
					createDescriptionInformation();
					createChapterPlaylist();
					createAudioPlayer();
					bindShortcuts();
					var lng = settings.lang === '' ? window.navigator.language : settings.lang; 
					$.i18n.init({load: 'unspecific', lng: lng, resGetPath:'../translations/__lng__.json', fallbackLng: settings.fallbackLng}, function(){
						$('.fandango-player').i18n();
						$('.fandango-status').i18n();
						if(!settings.descriptionContainer) return;
						$('.fandango-description').i18n();
						openHelpModal();
						initSpeechRecognition();
					});
					
				});
			}
			
		};

		generatePlayer();

		return this;
	};
}(jQuery)); 
