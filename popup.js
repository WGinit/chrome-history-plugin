

// 时间戳转时间
function getLocalTime(nS) {
  return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/,' ');
}

var nextEndTimeToUse = 0;
var allItems = [];
var itemIdToIndex = {};

function getMoreHistory() {
  return new Promise((resolve) => {
      var params = {text:"", maxResults: 50};
      params.startTime = 0;
      if (nextEndTimeToUse > 0)
      params.endTime = nextEndTimeToUse;
      chrome.history.search(params, function(items) {
          for (var i = 0; i < items.length; i++) {
              var item = items[i];
              if (!itemIdToIndex[item.title]) {
                  allItems.push({
                      title: item.title,
                      url: item.url,
                      lastVisitTime: getLocalTime(item.lastVisitTime)
                  });
              }
          }
          console.log('allItems', allItems);
          resolve(allItems)
      });
  })
}

const pagelistEle = document.getElementById('pagelist');

async function render() {
  let pages = await getMoreHistory();
  if (pages.length) {

    pages.forEach((element, index) => {
      console.log(element)
      let alink = document.createElement('a');
      let title = document.createTextNode(index + 1 + '. ' + element.title);
      let span = document.createElement('span')
      span.innerHTML = '   (' + element.lastVisitTime + ')';
      alink.appendChild(title);
      alink.appendChild(span);
      alink.setAttribute('href', '#');
      alink.setAttribute('data-url', element.url);
      alink.setAttribute('data-title', element.title);
      alink.addEventListener('click', function (e) {
        console.log(e.currentTarget.dataset.url);
        const { title, url } = e.currentTarget.dataset
        chrome.tabs.create({ url: url }, (tab) => {
          chrome.storage.local.get('historyPages', function (res) {
            let temp = {
              title: title,
              url: url,
              lastVisitTime: getLocalTime(+new Date())
            }
            if (res.historyPages.length > 50) {
              res.historyPages.pop()
              res.historyPages.unshift(temp)
            } else {
              res.historyPages.unshift(temp)
            }

            chrome.storage.local.set({ 'historyPages': res.historyPages }, () => {
                console.log(res.historyPages);


            });
          })
          console.log(tab);
        })

      })
      let li = document.createElement('li');
      li.appendChild(alink);
      pagelistEle.appendChild(li);
    });
  } else {
    let li = document.createElement('li');
    li.innerHTML = '暂无记录'
    pagelistEle.appendChild(li);
  }
}

render()






