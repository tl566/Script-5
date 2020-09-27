/**
 * 在API聚合数据里注册申请 token https://api.bubaijun.com/home
 *
 *
 *[task_local]
 * 1 9 * * * https://raw.githubusercontent.com/dompling/Script/master/historyToday/index.js
 *
 */
const $ = new API("historyToday", true);
const titleName = "📆历史上的今天";
const baseUrl = "https://zhufred.gitee.io/zreader/ht/event/";
const headers = {
  accept: "*",
  "Content-type": "application/json",
};

const date = new Date();
let month = date.getMonth() + 1;
month = month > 10 ? month : `0${month}`;
const day = date.getDate();

!(async ($) => {
  const data = await getHistoryToday();
  let content = "",
    subTitle = `${month}-${day}`;
  if (data.length > 0) {
    data.forEach((item) => {
      content += `[📍]${item.title}\n`;
    });
  }
  if ($.env.isSurge) {
    $.notify(titleName, subTitle, content);
  } else {
    $.notify(titleName, subTitle, content);
  }
})($)
  .catch((err) => {
    $.log(err);
    $.notify(titleName, "", "❎原因：" + err.message || err);
  })
  .finally($.done());

function getHistoryToday() {
  const requestConfig = {
    url: `${baseUrl}${month}${day}.json`,
    headers,
  };
  console.log(requestConfig);
  return $.http.get(requestConfig).then((res) => {
    const { body } = res;
    const response = JSON.parse(body);
    return response;
  });
}

// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!this.isLoon,o="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!o,isJSBox:o,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}
function HTTP(e, t = {}) {
  const { isQX: s, isLoon: o, isSurge: i, isScriptable: n, isNode: r } = ENV();
  const u = {};
  return (
    ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"].forEach(
      (h) =>
        (u[h.toLowerCase()] = (u) =>
          (function (u, h) {
            (h = "string" == typeof h ? { url: h } : h).url = e
              ? e + h.url
              : h.url;
            const c = (h = { ...t, ...h }).timeout,
              d = {
                onRequest: () => {},
                onResponse: (e) => e,
                onTimeout: () => {},
                ...h.events,
              };
            let l, a;
            if ((d.onRequest(u, h), s)) l = $task.fetch({ method: u, ...h });
            else if (o || i || r)
              l = new Promise((e, t) => {
                (r ? require("request") : $httpClient)[u.toLowerCase()](
                  h,
                  (s, o, i) => {
                    s
                      ? t(s)
                      : e({
                          statusCode: o.status || o.statusCode,
                          headers: o.headers,
                          body: i,
                        });
                  }
                );
              });
            else if (n) {
              const e = new Request(h.url);
              (e.method = u),
                (e.headers = h.headers),
                (e.body = h.body),
                (l = new Promise((t, s) => {
                  e.loadString()
                    .then((s) => {
                      t({
                        statusCode: e.response.statusCode,
                        headers: e.response.headers,
                        body: s,
                      });
                    })
                    .catch((e) => s(e));
                }));
            }
            const f = c
              ? new Promise((e, t) => {
                  a = setTimeout(
                    () => (
                      d.onTimeout(),
                      t(`${u} URL: ${h.url} exceeds the timeout ${c} ms`)
                    ),
                    c
                  );
                })
              : null;
            return (f
              ? Promise.race([f, l]).then((e) => (clearTimeout(a), e))
              : l
            ).then((e) => d.onResponse(e));
          })(h, u))
    ),
    u
  );
}
function API(e = "untitled", t = !1) {
  const { isQX: s, isLoon: o, isSurge: i, isNode: n, isJSBox: r } = ENV();
  return new (class {
    constructor(e, t) {
      (this.name = e),
        (this.debug = t),
        (this.http = HTTP()),
        (this.env = ENV()),
        (this.node = (() => {
          if (n) {
            return { fs: require("fs") };
          }
          return null;
        })()),
        this.initCache();
      Promise.prototype.delay = function (e) {
        return this.then(function (t) {
          return ((e, t) =>
            new Promise(function (s) {
              setTimeout(s.bind(null, t), e);
            }))(e, t);
        });
      };
    }
    initCache() {
      if (
        (s && (this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}")),
        (o || i) &&
          (this.cache = JSON.parse($persistentStore.read(this.name) || "{}")),
        n)
      ) {
        let e = "root.json";
        this.node.fs.existsSync(e) ||
          this.node.fs.writeFileSync(
            e,
            JSON.stringify({}),
            { flag: "wx" },
            (e) => console.log(e)
          ),
          (this.root = {}),
          (e = `${this.name}.json`),
          this.node.fs.existsSync(e)
            ? (this.cache = JSON.parse(
                this.node.fs.readFileSync(`${this.name}.json`)
              ))
            : (this.node.fs.writeFileSync(
                e,
                JSON.stringify({}),
                { flag: "wx" },
                (e) => console.log(e)
              ),
              (this.cache = {}));
      }
    }
    persistCache() {
      const e = JSON.stringify(this.cache);
      s && $prefs.setValueForKey(e, this.name),
        (o || i) && $persistentStore.write(e, this.name),
        n &&
          (this.node.fs.writeFileSync(
            `${this.name}.json`,
            e,
            { flag: "w" },
            (e) => console.log(e)
          ),
          this.node.fs.writeFileSync(
            "root.json",
            JSON.stringify(this.root),
            { flag: "w" },
            (e) => console.log(e)
          ));
    }
    write(e, t) {
      this.log(`SET ${t}`),
        -1 !== t.indexOf("#")
          ? ((t = t.substr(1)),
            i & o && $persistentStore.write(e, t),
            s && $prefs.setValueForKey(e, t),
            n && (this.root[t] = e))
          : (this.cache[t] = e),
        this.persistCache();
    }
    read(e) {
      return (
        this.log(`READ ${e}`),
        -1 === e.indexOf("#")
          ? this.cache[e]
          : ((e = e.substr(1)),
            i & o
              ? $persistentStore.read(e)
              : s
              ? $prefs.valueForKey(e)
              : n
              ? this.root[e]
              : void 0)
      );
    }
    delete(e) {
      this.log(`DELETE ${e}`),
        -1 !== e.indexOf("#")
          ? ((e = e.substr(1)),
            i & o && $persistentStore.write(null, e),
            s && $prefs.removeValueForKey(e),
            n && delete this.root[e])
          : delete this.cache[e],
        this.persistCache();
    }
    notify(e, t = "", u = "", h = {}) {
      const c = h["open-url"],
        d = h["media-url"],
        l = u + (c ? `\n点击跳转: ${c}` : "") + (d ? `\n多媒体: ${d}` : "");
      if (
        (s && $notify(e, t, u, h),
        i && $notification.post(e, t, l),
        o && $notification.post(e, t, u, c),
        n)
      )
        if (r) {
          require("push").schedule({ title: e, body: (t ? t + "\n" : "") + l });
        } else console.log(`${e}\n${t}\n${l}\n\n`);
    }
    log(e) {
      this.debug && console.log(e);
    }
    info(e) {
      console.log(e);
    }
    error(e) {
      console.log("ERROR: " + e);
    }
    wait(e) {
      return new Promise((t) => setTimeout(t, e));
    }
    done(e = {}) {
      s || o || i
        ? $done(e)
        : n &&
          !r &&
          "undefined" != typeof $context &&
          (($context.headers = e.headers),
          ($context.statusCode = e.statusCode),
          ($context.body = e.body));
    }
  })(e, t);
}
/*****************************************************************************/
