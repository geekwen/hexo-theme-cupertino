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
    const KEY = 'data-color-scheme';
    const THEME_LIST = ['auto', 'light', 'dark'];
    const bodyEl = document.body;
    let saveTheme = function (theme) {
      if (!THEME_LIST.includes(theme)) theme = 'auto';
      bodyEl.setAttribute(KEY, theme);
      localStorage.setItem(KEY, theme);
    }

    let current = localStorage.getItem(KEY);
    saveTheme(current);
    let inputElList = [].slice.call(document.querySelectorAll('#theme-nav input'));
    inputElList.some(function (inputElItem) {
      if (inputElItem.value === current) {
        inputElItem.checked = true;
        return true;
      }
    })

    document.getElementById('theme-nav').addEventListener('click', function (event) {
      let value = event.target.value;
      if (THEME_LIST.includes(value)) {
        saveTheme(value);
      }
    })
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