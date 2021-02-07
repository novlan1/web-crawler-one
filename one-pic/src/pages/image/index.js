import React from 'react';
import { Tooltip, Input, message, BackTop } from 'antd';
import {
  CopyTwoTone,
} from "@ant-design/icons";

import ImagePreview from '../../components/image-preview'
import {
  getScrollHeight,
  getScrollTop,
  getClientHeight,
  getOnePicCreatedStamp,
  timeStampFormat,
  copyLink,
  isPC
} from '../../utils/util'
import { QINIU_HOST_NAME } from '../../config';
import { getImages } from '../../store/api'
import './index.scss'

const { Search } = Input;

class ImageManage extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      imageList: [],
      imageTotal: -1,
      loading: true,
      
      preViewIndex: 0,
      previewVisible: false,

      searchVal: '',
      pageNo: 1,
      extraLoadTimes: 0,

      marinSearchSize: 'default', // 搜索框尺寸

    }
  }

  componentDidMount() {
    this.onGetImages();
    this.onJudgeScreenWidth();
    window.addEventListener("scroll", this.onBindScroll);
    this.onJudgeMobile();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.onBindScroll);
  }

  onJudgeMobile = () => {
    this.setState({
      isMobile: !isPC()
    })
  }
  onJudgeScreenWidth = () => {
    let marinSearchSize = 'default'
    const { clientWidth } = document.body;

    if (clientWidth < 1000) {
      marinSearchSize = 'default';
    } else if (clientWidth < 600) {
      marinSearchSize = 'small'
    }

    this.setState({
      marinSearchSize
    })
  }

  onBindScroll = () => {
    const { pageNo, imageTotal, imageList, loading } = this.state;
    if (imageTotal <= imageList.length || loading) return;

    if (getScrollTop() + getClientHeight() + 100 >= getScrollHeight()) {
      // console.log('下拉刷新了')
      this.setState(
        {
          pageNo: pageNo + 1,
        },
        () => {
          this.onGetImages();
        }
      );
    }
  }

  onGetImages = (isNewLoad) => {
    let { imageList, imageTotal, pageNo, searchVal, extraLoadTimes } = this.state;

    this.setState({
      loading: true,
    })

    getImages({
      pageNo,
      pageSize: 20,
      search: searchVal,
    }).then(res => {
      const data = res.data || {};
      imageTotal = data.count || 0;
      const dataList = data.data || [];
      

      dataList.map(item => {
        item.pureQiniuKey = item.qiniu_key.replace('.jpg', '');
        item.realUrl = QINIU_HOST_NAME + item.qiniu_key;
        item.showDesc = `${item.description} - ${item.pureQiniuKey}`;

        if (!item.stamp && item.qiniu_key) {
          item.stamp = getOnePicCreatedStamp(item.pureQiniuKey);
          item.formatedDate = timeStampFormat(item.stamp, 'yyyy-MM-dd')
        }
      })
      if (isNewLoad) {
        imageList = dataList;
      } else {
        imageList = imageList.concat(dataList);
      }

      this.setState({
        imageList,
        imageTotal,
        extraLoadTimes: extraLoadTimes + 1
      }, () => {
        if (imageTotal > imageList.length && extraLoadTimes < 2) {
          this.onGetMoreData();
        }
      })
      this.forceUpdate();

    }).finally(() => {
      this.setState({
        loading: false
      })
    })
  }

  onPreView = (e, item, index) => {
    e.stopPropagation();
    this.setState({
      preViewIndex: index,
      previewVisible: true,
    });
  };

  onSearch = (val) => {
    this.setState(
      {
        searchVal: val,
        isNewLoad: true,
        pageNo: 1,
        extraLoadTimes: 0
      },
      () => {
        this.onGetImages(true);
      }
    );
  };

  onCopyLink = (e, item) => {
    e.stopPropagation();
    const value = QINIU_HOST_NAME + item.qiniu_key;
    copyLink(value);

    message.success(`${value} 复制成功 🎉`);
  }

  onGetMoreData = () => {
    const { pageNo } = this.state
    this.setState({
      pageNo: pageNo + 1
    }, () => {
      this.onGetImages()
    })
  }

  render() {
    const { imageList, isMobile, loading, imageTotal, marinSearchSize, previewVisible, preViewIndex } = this.state;

    return (
      <div className="image-container">
        <div className="search-wrap">
          <Search placeholder="input search text" enterButton="搜索" onSearch={this.onSearch} size={marinSearchSize} />
        </div>

        <div className="images-list-wrap">
          {imageList.map((item, index) => (
            <div
              key={item.id}
              className='image-item' 
              onClick={(e) => this.onPreView(e,item, index)}
            >
              <div className="image-wrap">
                <Tooltip title={isMobile ? "" : item.showDesc} placement="bottom">
                  <img
                    src={item.realUrl}
                    alt=""
                    className="main-image"
                  />
                </Tooltip>
                {!isMobile && <div className="btn-line">
                  <span className="btn-line-left">
                  </span>
                  <span className="btn-line-right">
                    <Tooltip title="复制链接" placement="top">
                      <CopyTwoTone
                        style={{ fontSize: 16 }}
                        twoToneColor="#52c41a "
                        onClick={(e) => this.onCopyLink(e, item)}
                      />
                    </Tooltip>
                  </span>
                  </div>
                }
              </div>
              <span className="image-title">{item.formatedDate}</span>
            </div>
          ))}
          <div className="image-item-place"></div>
          <div className="image-item-place"></div>
          <div className="image-item-place"></div>
          <div className="image-item-place"></div>
          <div className="image-item-place"></div>
          <div className="image-item-place"></div>
          {imageTotal === 0 && 
            <div className="no-data">
              {loading ? "正在加载..." : '暂无数据'}
            </div>
          }
        </div>

        <div className={`loading-images`}>
          {imageTotal <= 0 ? null : imageList.length >= imageTotal ? (
            <span>
              <i>————</i>
              <span>我也是有底线的</span>
              <i>————</i>
            </span>
          ) : loading ? (
            "正在加载..."
          ) : (
            "下拉加载更多"
          )}
        </div>

        {previewVisible && (
          <ImagePreview
            imageList={imageList}
            preViewIndex={preViewIndex}
            onGetMoreData={this.onGetMoreData}
            cancelModal={() => this.setState({ previewVisible: false })}
          />
        )}

        <BackTop />
      </div>
    )
  }
}


export default ImageManage;