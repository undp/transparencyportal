
import { h, Component } from 'preact';
import ImageGallery from 'react-image-gallery';
import { route } from 'preact-router';
import style from './style';

export default class PictureGallery extends Component {
  render() {
    return (
      <ImageGallery
      showFullscreenButton={false}
      showPlayButton={false}
      showBullets={true}
      width={300}
      height={300}
      originalClass={style.image_sizewrapper}
      items={this.props.pictureList.data}
     />
    );
  }
}
