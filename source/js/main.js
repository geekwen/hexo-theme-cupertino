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

    document.addEventListener("DOMContentLoaded", function () {
      let lazyImages = [].slice.call(document.querySelectorAll(".post-list-item .cover-img img"));

      let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) return;
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.parentElement.classList.remove('no-image');
          lazyImageObserver.unobserve(lazyImage);
        });
      });

      lazyImages.forEach(function (lazyImage) {
        lazyImageObserver.observe(lazyImage);
      });

      let sliderItems = [].slice.call(document.querySelectorAll(".post-list-item, .year-title, .content img, .content iframe"));
      let sliderObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          let sliderItem = entry.target;
          sliderItem.classList.add('view');
          sliderObserver.unobserve(sliderItem);
        })
      }, { threshold: 0.3 })
      sliderItems.forEach(function (sliderItem) {
        sliderObserver.observe(sliderItem);
      })
    })
  }
}

pagePlugins.init();