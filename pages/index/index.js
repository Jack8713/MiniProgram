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

  getMusic() {
    wx.request({
      url: "https://api.obfs.dev/api/netease/search",
      data: {
        s: this.data.songName
      },
      success: (response) => {
        this.setData({
          musicList: response.data.result.songs
        })
        console.log(this.data.musicList)
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
    wx.request({
      url: 'https://api.obfs.dev/api/netease/song',
      data: {
        id: item.currentTarget.dataset.id
      },
      success: (response) => {
        this.setData({
          musicUrl: response.data.data[0].url
        })
      }
    })
    wx.request({
      url: 'https://api.obfs.dev/api/netease/comments',
      data: {
        id: item.currentTarget.dataset.id
      },
      success: (response) => {
        this.setData({
          commentList: response.data.hotComments
        })
      }
    })
    wx.request({
      url: 'https://api.obfs.dev/api/netease/album',
      data: {
        id: item.currentTarget.dataset.gid
      },
      success: (response) => {
        this.setData({
          picUrl: response.data.album.picUrl
        })
      }
    })
    wx.request({
      url: 'https://api.obfs.dev/api/netease/lyric',
      data: {
        id: item.currentTarget.dataset.id
      },
      success: (response) => {
        this.setData({
          lyric: (response.data.lrc.lyric).replace(/[\\r\\n]/g, '')
        })
      }
    })
  },


  playMusicaxios(item) {
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
      this.data.lrcList.push(v.slice(9))
    })
    this.data.lrcList.shift()
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
    this.data.sliderTime = parseInt(myaudio.currentTime / myaudio.maxTime * 100)
    if (this.data.lyric !== '暂无歌词') {
      this.data.lrcObj.map((v, index) => {
        if (v.T === Math.floor(myaudio.currentTime)) {
          this.data.lrcIndex = index
          this.data.currentLrc = player.lrcObj[this.data.lrcIndex]["V"]
        }
      })
    }
  },
})