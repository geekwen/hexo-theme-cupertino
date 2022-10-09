const pagePlugins = new class {
  init() {
    this.navToggle();
    this.themeToggle();
    this.intersectionObservers();
  }

  navToggle () {
    let navEl = document.getElementById('theme-nav');
    let getNavHeight = function () {
      return 48 + document.querySelector('#theme-nav .nav-items').clientHeight + 'px';
    }
    navEl.addEventListener('click', (e) => {
      if (window.innerWidth <= 600) {
        navEl.style.height = navEl.classList.contains('open')
          ? ''
          : getNavHeight();

        navEl.classList.toggle('open')
      } else {
        if (navEl.classList.contains('open')) {
          navEl.style.height = ''
          navEl.classList.remove('open')
        }
      }
    })

    window.addEventListener('resize', (e) => {
      if (navEl.classList.contains('open')) {
        navEl.style.height = getNavHeight();
      }
      if (window.innerWidth > 600) {
        if (navEl.classList.contains('open')) {
          navEl.style.height = ''
          navEl.classList.remove('open')
        }
      }
    })
  }

  themeToggle() {
    // a simple solution for managing cookies
    const Cookies = new class {
      get(key, fallback) {
        const temp = document.cookie.split('; ').find(row => row.startsWith(key + '='))
        if (temp) {
          return temp.split('=')[1];
        } else {
          return fallback
        }
      }
      set(key, value) {
        document.cookie = key + '=' + value + '; path=' + document.body.getAttribute('data-config-root')
      }
    }

    const ColorScheme = new class {
      constructor() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { this.updateCurrent(Cookies.get('color-scheme', 'auto')) })
      }
      get() {
        const stored = Cookies.get('color-scheme', 'auto')
        this.updateCurrent(stored)
        return stored
      }
      set(value) {
        bodyEl.setAttribute('data-color-scheme', value)
        Cookies.set('color-scheme', value)
        this.updateCurrent(value)
        return value
      }
      updateCurrent(value) {
        var current = 'light'
        if (value == 'auto') {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            current = 'dark'
          }
        } else {
          current = value
        }
        document.body.setAttribute('data-current-color-scheme', current)
      }
    }

    if (document.getElementById('theme-color-scheme-toggle')) {
      var bodyEl = document.body
      var themeColorSchemeToggleEl = document.getElementById('theme-color-scheme-toggle')
      var options = themeColorSchemeToggleEl.getElementsByTagName('input')

      if (ColorScheme.get()) {
        bodyEl.setAttribute('data-color-scheme', ColorScheme.get())
      }

      for (const option of options) {
        if (option.value == bodyEl.getAttribute('data-color-scheme')) {
          option.checked = true
        }
        option.addEventListener('change', (ev) => {
          var value = ev.target.value
          ColorScheme.set(value)
          for (const o of options) {
            if (o.value != value) {
              o.checked = false
            }
          }
        })
      }
    }
  }

  intersectionObservers() {
    if (!("IntersectionObserver" in window)) {
      console.warn('Your browser doesnt support IntersectionObserver, so lazyload cant use')
      return;
    }

    let setIntersectionObserver = function (classNames, callback, options) {
      let elList = [].slice.call(document.querySelectorAll(classNames));
      let observeInc = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          callback(entry, observeInc);
        })
      }, options || null)
      elList.forEach(function (elItem) {
        observeInc.observe(elItem);
      });
    }

    document.addEventListener("DOMContentLoaded", function () {
      // lazy load post list images
      setIntersectionObserver(
        ".post-list-item .cover-img img",
        function (entry, observeInc) {
          if (!entry.isIntersecting) return;
          let imgEl = entry.target;
          imgEl.src = imgEl.dataset.src;
          imgEl.parentElement.classList.remove('no-image');
          observeInc.unobserve(imgEl);
        },
      )

      // add view animation
      setIntersectionObserver(
        ".post-list-item, .year-title, .content img, .content iframe",
        function (entry, observeInc) {
          if (!entry.isIntersecting) return;
          let sliderItem = entry.target;
          sliderItem.classList.add('view');
          observeInc.unobserve(sliderItem);
        },
        { threshold: 0.3 }
      )
    })
  }
}

pagePlugins.init();