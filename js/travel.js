$(function() {
  var sections = [
    { 
      city: "Vancouver",
      background: "//farm6.staticflickr.com/5487/9484888462_f3298d349f_b.jpg",
      photos: [{ href: "//farm3.staticflickr.com/2592/13040917453_0918d7c24f_b.jpg", title: ""},
               { href: "//farm3.staticflickr.com/2592/13040917453_0918d7c24f_b.jpg", title: ""}]
    },
    { 
      city: "Paris",
      background: "//farm9.staticflickr.com/8166/7416259604_481f00d964_b.jpg"
    },
    { 
      city: "Barcalona",
      background: "//farm9.staticflickr.com/8292/7660553146_125f3d772f_b.jpg"
    },
    { 
      city: "Beijing",
      background: "//farm8.staticflickr.com/7055/6974971289_9a3bd72b9c_b.jpg"
    },
    { 
      city: "Boston",
      background: "//farm8.staticflickr.com/7192/6841434358_aeabddd3d2_b.jpg"
    },
    { 
      city: "Amsterdam",
      background: "//farm9.staticflickr.com/8141/7417074766_0b9664f395_b.jpg"
    },
    { 
      city: "Rome",
      background: "//farm8.staticflickr.com/7262/7662390758_75476cda9c_b.jpg"
    },
    { 
      city: "Taipei",
      background: "//farm3.staticflickr.com/2592/13040917453_0918d7c24f_b.jpg",
      photos: [{ href: "//farm3.staticflickr.com/2592/13040917453_0918d7c24f_b.jpg", title: ""},
               { href: "//farm3.staticflickr.com/2592/13040917453_0918d7c24f_b.jpg", title: ""}]
    },
    { 
      city: "Seattle",
      background: "//farm7.staticflickr.com/6210/6151752691_be640cc0d5_b.jpg",
      photos: [{ href: "//farm3.staticflickr.com/2592/13040917453_0918d7c24f_b.jpg", title: ""},
               { href: "//farm3.staticflickr.com/2592/13040917453_0918d7c24f_b.jpg", title: ""}]
    },
    { 
      city: "London",
      background: "//farm6.staticflickr.com/5465/7407925158_a8487f0323_b.jpg",
      photos: [{ href: "//farm3.staticflickr.com/2592/13040917453_0918d7c24f_b.jpg", title: ""},
               { href: "//farm3.staticflickr.com/2592/13040917453_0918d7c24f_b.jpg", title: ""}]
    }
  ];

  // build a parallax section for every city
  $.each(sections, function(i, section) {
    var wrapper = $("<div>");
    var title   = $("<div>").html(section.city);
    var size    = '300px';
    wrapper.css({
      'background': 'url("' + section.background + '") no-repeat center center fixed',
      'background-size': 'cover',
      'min-width': '500px',
      'height': size
    });
    title.css({
      'line-height': size,
      'text-align': 'center',
      'font-size': '100px',
      'font-family': '"Cabin Sketch", cursive',
      'color': 'orange'
    });
    title.appendTo(wrapper);
    wrapper.appendTo( $('#travelfeed') );
  });

});
