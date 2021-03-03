import React from "react";
import { Modal } from "antd";
import {
  RightOutlined,
  LeftOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import { QINIU_HOST_NAME } from '../../config'
import {
  getSmallImgSrc
} from '../../utils/util';
import "./index.scss";


const getWholeUrl = (item) => {
  if (!item) return ''
  return QINIU_HOST_NAME + item.qiniu_key
}
let startx = 0
let starty = 0
let endy = 0
let endx = 0

// 图片预览
class ImagePreview extends React.Component{
  constructor(props) {
    super(props)
    this.imgRef = React.createRef();

    this.state = {
      preViewIndex: props.preViewIndex || 0,
      imgWidth: 0,
    }
  }

  componentDidMount() {
    window.addEventListener('keyup', this.onBindKeyUp)
    window.addEventListener('touchstart', this.onBindTouchStart)
    window.addEventListener('touchend', this.onBindTouchMove)
    setTimeout(() => {
      this.setState({
        showBtnLine: true,
      })
    }, 400)
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.onBindKeyUp)
    window.removeEventListener('touchstart', this.onBindTouchStart)
    window.removeEventListener('touchend', this.onBindTouchMove)
  }

  onBindTouchStart = (e) => {
    var touch = e.changedTouches;  
    startx = touch[0].clientX; 
    starty = touch[0].clientY;
  }

  onBindTouchMove = (e) => {
    if (e.target && e.target.classList) {
      if (e.target.classList.contains('description')) {
        return
      }
    }
    
    var touch = e.changedTouches;  
    endx = touch[0].clientX;  
    endy = touch[0].clientY; 
    if (startx - endx > 10) {
      this.onToNext()
    } else if (startx - endx < -10) {
      this.onToLast()
    }
  }

  onToLast = () => {
    const { preViewIndex } = this.state
    if (preViewIndex <= 0) return
    this.setState({
      preViewIndex: preViewIndex - 1
    })
  }
 
  onToNext = () => {
    const { preViewIndex } = this.state
    const { imageList, onGetMoreData } = this.props
    if (preViewIndex >= imageList.length - 3) {
      if (typeof onGetMoreData === 'function') {
        onGetMoreData()
      }
    }
    if (preViewIndex >= imageList.length - 1) {
      return 
    }
    this.setState({
      preViewIndex: preViewIndex + 1
    })
  }

  onBindKeyUp = (e) => {
    if (e.keyCode === 37) {
      this.onToLast()
    } else if (e.keyCode === 39) {
      this.onToNext()
    }
  }

  onCancelModal = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.props.cancelModal();
  }

  onClickImg = (e) => {
    console.log(e)
  }

  onDownLoadImg = (imgsrc) => {
    const { imageList } = this.props
    const { preViewIndex } = this.state
    const _name = imageList[preViewIndex].origin_name

    let image = new Image();
    // 解决跨域 Canvas 污染问题
    image.setAttribute("crossOrigin", "anonymous");
    image.onload = function() {
      let canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      let context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, image.width, image.height);
      let url = canvas.toDataURL("image/png"); //得到图片的base64编码数据
      let a = document.createElement("a"); // 生成一个a元素
      let event = new MouseEvent("click"); // 创建一个单击事件
      a.download = _name || "photo"; // 设置图片名称
      a.href = url; // 将生成的URL设置为a.href属性
      a.dispatchEvent(event); // 触发a的单击事件
    };
    image.src = imgsrc;
  }

  onGetSmallImgSrc = (url) => {
    const { imgWidth } = this.state;
    console.log('imgWidth: ', imgWidth)

    if (!imgWidth) {
      this.onComputeImgWidth();
      return url;
    }
    return getSmallImgSrc(url, imgWidth)
  }

  onComputeImgWidth = () => {
    if (this.imgRef.current) {
      const { current } = this.imgRef;

      this.imgRef.current.onload = () => {
          console.log('onload offsetWidth', current.offsetWidth)
          this.setState({
            imgWidth: current.offsetWidth * 2

          })
      }
    }
  }

  render() {
    const { imageList } = this.props
    const { preViewIndex, showBtnLine } = this.state
    const preViewSrc = imageList[preViewIndex].realUrl

    return (
      <Modal 
        centered 
        visible={true} 
        footer={null} 
        onCancel={this.props.cancelModal}
        style={{width: 'auto'}}
        className='priview-modal'
        maskStyle={{ background: 'rgba(0, 0, 0, 0.9)' }}
      >
        <div className={`btn-line ${showBtnLine ? 'show' : ''}`}>
          <a href={preViewSrc} target='_blank' className='check-origin-img btn'>
            查看原图
          </a>
          <span
            className='download-img btn'
            onClick={()=>this.onDownLoadImg(preViewSrc)}
          >
            下载
          </span>
        </div>
        <div className='half-preview half-left' onClick={this.onToLast}>
          { preViewIndex > 0 &&
            <span className='preview-handle last-one'>
              上一张
              <LeftOutlined style={{ fontSize: 50, margin: '0 6px' }} />
            </span>
          }
        </div>
        <div className='img-wrap'>
            <img alt="" src={this.onGetSmallImgSrc(preViewSrc)} onClick={this.onClickImg} ref={this.imgRef} />
          <div className='description'>
            {imageList[preViewIndex] && imageList[preViewIndex].showDesc}
          </div>
          <CloseOutlined 
            onClick={this.onCancelModal} 
            onTouchEnd={this.onCancelModal}
            style={{userSelect: 'none'}}
          />
        </div>
        <div className='half-preview half-right' onClick={this.onToNext}>
          { (preViewIndex < imageList.length - 1) &&
            <span className='preview-handle next-one'>
              <RightOutlined style={{ fontSize: 50, margin: '0 6px' }} />
              下一张
            </span>
          }
        </div>
        
      </Modal>
    )
  }
}

export default ImagePreview;
