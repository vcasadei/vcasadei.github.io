var enteredArea = false;
var data = [
  {
  action: 'type',
  clear: true,
  strings: ['Hi, my name is Vitor Casadei'],
    output: '<span class="gray">I\'m a computer scientist from Sorocaba (São Paulo area) in <b class="green">Brazil</b>.</span>&nbsp;',
  postDelay: 600
},
  {
  action: 'type',
  strings: ["I like to accept challenges"],
    output: '<span class="gray">and learn new things, and so, I\'m always doing something <span class="yellow"><b>different</b></span> and <span class="green"><b>new</b></span>!</span>&nbsp;',
  postDelay: 600
},
  {
  action: 'type',
  strings: ['I develop software, websites, mobile apps, write in blogs and also do UX Research.'],
    output: '<span class="gray">So, check my <a class="green" href="#resume" target="_blank">resume</a>, my <a class="yellow" href="#portfolio" target="_blank">portifolio</a>, my work at <a class="green" href="http://diariodoverde.com/author/vitor-casadei/" target="_blank">Diário do Verde</a>, my <a class="yellow" href="/blog" target="_blank">blog</a> posts and other contents on my website and <a class="red" href="#contact" target="_blank">get in touch</a>!</span>&nbsp;',
  postDelay: 600
},
  {
  action: 'type',
  strings: ['Also, check my social media bellow!']
}

];

function runScripts(data, pos) {
    var prompt = $('.prompt'),
        script = data[pos];
    if(script.clear === true) {
      $('.history').html('');
    }
    switch(script.action) {
        case 'type':
          // cleanup for next execution
          prompt.removeData();
          $('.typed-cursor').text('');
          prompt.typed({
            strings: script.strings,
            typeSpeed: 10,
            callback: function() {
              var history = $('.history').html();
              history = history ? [history] : [];
              history.push('$ ' + prompt.text());
              if(script.output) {
                history.push(script.output);
                prompt.html('');
                $('.history').html(history.join('<br>'));
              }
              // scroll to bottom of screen
              $('section.terminal').scrollTop($('section.terminal').height());
              // Run next script
              pos++;
              if(pos < data.length) {
                setTimeout(function() {
                  runScripts(data, pos);
                }, script.postDelay || 1000);
              }
            }
          });
          break;
        case 'view':

          break;
    }
};

document.onreadystatechange = function(){
  var state = document.readyState;
  if (state == 'interactive') {
      // do something
  } else if (state == 'complete') {
    (document.getElementsByClassName('logo')[0]).onclick = function() {
        window.location.href = "#";
    };

    (document.getElementsByClassName('logo')[0]).onmouseover = function() {
      this.style.color = "rgb(161, 5, 0)";
      (this.children[0]).style.color = "rgb(161, 5, 0)";
    };
    (document.getElementsByClassName('logo')[0]).onmouseout = function() {
      this.style.color = "#FFF";
      (this.children[0]).style.color = "#FFF";
    };

    document.querySelector( "#activator" ).addEventListener( "click", function() {
      this.classList.toggle( "active" );
      document.querySelector( "#box" ).classList.toggle( "menu-hidden" );

    });

    window.addEventListener(
        'scroll',
        function()
        {
            var homePos = document.getElementById('home').offsetHeight;
            var aboutPos = document.getElementById('about').offsetHeight;
            var currentPos = document.body.scrollTop || document.documentElement.scrollTop;
            if ( currentPos >= homePos && currentPos <= ( homePos + aboutPos ) && !enteredArea) {
              setTimeout(function(){
                currentPos = document.body.scrollTop || document.documentElement.scrollTop;
                if ( currentPos >= homePos && currentPos <= ( homePos + (aboutPos/2) ) && !enteredArea) {
                  enteredArea = true;
                  runScripts(data, 0);
                }

              }, 200);
            }

        },
        false
    )



  }
};
