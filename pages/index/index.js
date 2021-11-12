// index.js
// 获取应用实例

const app = getApp()

Page({
  data: {
    songName: '',
    musicList: [],
    musicUrl: '',
    picUrl: '',
    commentList: [],
    isPlay: false,
    lyric: '',
    lrcObj: [],
    lrcList: [],
    currentLrc: '',
    progress: '',
    sliderTime: 0,
    lrcIndex: 0,
    mvUrl: '',
    mvshow: false,
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  getMusic(){
    wx.request({
      url: "https://api.obfs.dev/api/netease/search",
      data: {
        s: this.data.songName
      },
      success: (response) => {
        console.log(response.data.result.songs)
        this.musicList = response.data.result.songs;
        //this.songName = "";
      }
    })
  },
  PlayMv(item) {
    axios.get('https://api.obfs.dev/api/netease/mv?id=' + item.mvid)
      .then(
        response => {
          this.mvUrl = response.data.data.url;
          this.musicUrl = '';
          this.mvshow = true;
        }), err => {}
  },
  playMusic(item) {
    axios.get('https://api.obfs.dev/api/netease/song?id=' + item.id)
      .then(
        response => {
          this.data.musicUrl = response.data.data[0].url;
        }), err => {}
    axios.get('https://api.obfs.dev/api/netease/comments?id=' + item.id)
      .then(
        response => {
          this.data.commentList = response.data.hotComments;
        }), err => {}
    axios.get('https://api.obfs.dev/api/netease/album?id=' + item.al.id)
      .then(
        response => {
          this.data.picUrl = response.data.album.picUrl;
        }), err => {}
    axios.get('https://api.obfs.dev/api/netease/lyric?id=' + item.id)
      .then(
        response => {
          this.data.lyric = response.data.lrc.lyric
          this.data.lyric = this.data.lyric.replace(/[\\r\\n]/g, '')
          if (this.data.lyric !== '') {
            this.data.lrcObj = this.handleLrc(this.data.lyric);
          } else {
            this.data.lyric = '暂无歌词';
          }
        }), err => {}
  },
  play() {
    this.isPlay = true
  },
  pause() {
    this.isPlay = false
  },
  handleLrc(v) {
    var lyrics = v.split('[')
    v.split('[').map(v => {
      this.lrcList.push(v.slice(9))
    })
    this.lrcList.shift()
    lyrics.shift()
    var b = []
    lyrics.map(v => {
      b.push('[' + v)
    })
    lyrics = b
    var lrcObj = []
    for (var i = 0; i < lyrics.length; i++) {
      var lyric = decodeURIComponent(lyrics[i])
      var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g
      var timeRegExpArr = lyric.match(timeReg)
      if (!timeRegExpArr) continue
      var clause = lyric.replace(timeReg, '')
      for (var k = 0, h = timeRegExpArr.length; k < h; k++) {
        var t = timeRegExpArr[k]
        const min = Number(String(t.match(/\[\d*/i)).slice(1))
        const sec = Number(String(t.match(/\:\d*/i)).slice(1))
        var time = min * 60 + sec
        lrcObj.push({
          'T': time,
          'V': clause
        })
      }
    }
    return lrcObj
  },
  onTimeupdate() {
    this.sliderTime = parseInt(myaudio.currentTime / myaudio.maxTime * 100)
    if (this.lyric !== '暂无歌词') {
      this.lrcObj.map((v, index) => {
        if (v.T === Math.floor(myaudio.currentTime)) {
          this.data.lrcIndex = index
          this.data.currentLrc = player.lrcObj[this.data.lrcIndex]["V"]
        }
      })
    }
  },
})