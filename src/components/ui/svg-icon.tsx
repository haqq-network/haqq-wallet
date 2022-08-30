import React from 'react';
import Svg, {Path, Rect} from 'react-native-svg';
import {SvgProps} from 'react-native-svg/src/elements/Svg';

export const Alert = ({style, color}: SvgProps) => (
  <Svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    style={style}
    color={color}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.30369 3.74657C9.59711 3.14506 10.0832 2.65895 10.6847 2.36553C12.1739 1.63913 13.9699 2.25744 14.6963 3.74657L21.4954 17.6848C21.6953 18.0944 21.7991 18.5442 21.7991 19C21.7991 20.6569 20.456 22 18.7991 22H5.20087C4.74507 22 4.29526 21.8962 3.8856 21.6963C2.39648 20.9699 1.77817 19.1739 2.50457 17.6848L9.30369 3.74657ZM12 10C11.4477 10 11 10.4478 11 11V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V11C13 10.4478 12.5523 10 12 10ZM11 17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17C13 16.4478 12.5523 16 12 16C11.4477 16 11 16.4478 11 17ZM11.1012 4.62341C11.199 4.42291 11.3611 4.26087 11.5616 4.16307C12.0579 3.92093 12.6566 4.12704 12.8988 4.62341L19.6979 18.5616C19.7645 18.6982 19.7991 18.8481 19.7991 19C19.7991 19.5523 19.3514 20 18.7991 20H5.20087C5.04894 20 4.899 19.9654 4.76245 19.8988C4.26607 19.6567 4.05997 19.058 4.3021 18.5616L11.1012 4.62341Z"
      fill="currentColor"
    />
  </Svg>
);

export const ArrowSend = ({style, color}: SvgProps) => (
  <Svg
    width="25"
    height="24"
    viewBox="0 0 25 24"
    fill="none"
    style={style}
    color={color}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.9551 8.52958C19.1506 8.72458 19.25 8.98073 19.25 9.23661C19.25 9.49248 19.1506 9.74814 18.9551 9.94364L18.8691 10.0296C18.4791 10.4206 17.8461 10.4206 17.4551 10.0296L13.5918 6.1663L13.5918 14.2366C13.5918 14.7886 13.1438 15.2366 12.5918 15.2366C12.0398 15.2366 11.5918 14.7886 11.5918 14.2366L11.5918 6.1663L7.72852 10.0296C7.33852 10.4206 6.70545 10.4206 6.31445 10.0296L6.22852 9.94364C5.83752 9.55364 5.83752 8.92058 6.22852 8.52958L11.8848 2.87333C12.2748 2.48233 12.9078 2.48233 13.2988 2.87333L18.9551 8.52958ZM6.25 19.4092C5.69772 19.4092 5.25 19.8569 5.25 20.4092C5.25 20.9615 5.69772 21.4092 6.25 21.4092L19.25 21.4092C19.8023 21.4092 20.25 20.9615 20.25 20.4092C20.25 19.8569 19.8023 19.4092 19.25 19.4092L6.25 19.4092Z"
      fill="currentColor"
    />
  </Svg>
);

export const ArrowReceive = ({style, color}: SvgProps) => (
  <Svg
    width="25"
    height="24"
    viewBox="0 0 25 24"
    fill="none"
    style={style}
    color={color}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.43527 8.58008C5.43527 8.83595 5.53469 9.09211 5.73019 9.28711L11.3864 14.9434C11.7774 15.3344 12.4105 15.3344 12.8005 14.9434L18.4568 9.28711C18.8478 8.89611 18.8478 8.26305 18.4568 7.87305L18.3708 7.78711C17.9798 7.39611 17.3468 7.39611 16.9568 7.78711L13.0935 11.6504L13.0935 3.58008C13.0935 3.02808 12.6455 2.58008 12.0935 2.58008C11.5415 2.58008 11.0935 3.02808 11.0935 3.58008L11.0935 11.6504L7.23019 7.78711C6.83919 7.39611 6.20613 7.39611 5.81613 7.78711L5.73019 7.87304C5.53469 8.06855 5.43527 8.3242 5.43527 8.58008ZM4.75 20.4092C4.75 19.8569 5.19772 19.4092 5.75 19.4092L18.75 19.4092C19.3023 19.4092 19.75 19.8569 19.75 20.4092C19.75 20.9615 19.3023 21.4092 18.75 21.4092L5.75 21.4092C5.19772 21.4092 4.75 20.9615 4.75 20.4092Z"
      fill="currentColor"
    />
  </Svg>
);

export const CloseCircle = ({style, color}: SvgProps) => (
  <Svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    style={style}
    color={color}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM16.4 9.05206L13.5746 11.8775L16.4 14.703C16.8703 15.1733 16.8749 15.9311 16.403 16.403C15.9344 16.8716 15.1771 16.8742 14.703 16.4L11.8775 13.5746L9.05206 16.4C8.5818 16.8703 7.82394 16.8749 7.35204 16.403C6.88341 15.9344 6.8809 15.1771 7.35501 14.703L10.1805 11.8775L7.35501 9.05206C6.88474 8.5818 6.88015 7.82394 7.35204 7.35204C7.82067 6.88341 8.57796 6.8809 9.05206 7.35501L11.8775 10.1805L14.703 7.35501C15.1733 6.88474 15.9311 6.88015 16.403 7.35204C16.8716 7.82067 16.8742 8.57796 16.4 9.05206Z"
      fill="currentColor"
    />
  </Svg>
);
export const Copy = ({style, color}: SvgProps) => (
  <Svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={style}
    color={color}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.4444 2.81473H6.51844C6.10934 2.81473 5.7777 3.14637 5.7777 3.55547V4.29622H9.4814C10.7087 4.29622 11.7036 5.29114 11.7036 6.51844V10.2221H12.4444C12.8535 10.2221 13.1851 9.8905 13.1851 9.4814V3.55547C13.1851 3.14637 12.8535 2.81473 12.4444 2.81473ZM11.7036 11.7036V12.4444C11.7036 13.6717 10.7087 14.6666 9.4814 14.6666H3.55547C2.32818 14.6666 1.33325 13.6717 1.33325 12.4444V6.51844C1.33325 5.29114 2.32817 4.29622 3.55547 4.29622H4.29622V3.55547C4.29622 2.32818 5.29114 1.33325 6.51844 1.33325H12.4444C13.6717 1.33325 14.6666 2.32817 14.6666 3.55547V9.4814C14.6666 10.7087 13.6717 11.7036 12.4444 11.7036H11.7036ZM2.81473 6.51844C2.81473 6.10934 3.14637 5.7777 3.55547 5.7777H9.4814C9.8905 5.7777 10.2221 6.10934 10.2221 6.51844V12.4444C10.2221 12.8535 9.8905 13.1851 9.4814 13.1851H3.55547C3.14637 13.1851 2.81473 12.8535 2.81473 12.4444V6.51844Z"
      fill="currentColor"
    />
  </Svg>
);

export const CopyConfirmation = ({style, color}: SvgProps) => (
  <Svg
    width="72"
    height="72"
    viewBox="0 0 72 72"
    fill="none"
    style={style}
    color={color}>
    <Path
      d="M10 37.2L29.2298 57.4788C29.4873 57.7502 29.9277 57.7225 30.149 57.4208L62 14"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </Svg>
);

export const ISLMIcon = ({style, color}: SvgProps) => (
  <Svg
    width="65"
    height="64"
    viewBox="0 0 65 64"
    fill="none"
    style={style}
    color={color}>
    <Rect x="0.5" width="64" height="64" rx="16" fill="currentColor" />
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M32.5001 10.667C38.3908 10.667 43.7245 13.055 47.585 16.9156C51.3998 20.7306 53.7764 25.9839 53.8321 31.7916V31.8037L53.8327 31.8829L53.8334 32.0003L53.8321 32.197V32.2097C53.7764 38.0174 51.3998 43.27 47.585 47.085C43.7245 50.9456 38.3915 53.3337 32.5001 53.3337C26.6094 53.3337 21.2757 50.9456 17.4152 47.085C13.5547 43.2244 11.1667 37.8906 11.1667 31.9997C11.1667 26.1087 13.5547 20.7756 17.4152 16.915C21.2757 13.0544 26.6094 10.667 32.5001 10.667ZM44.7614 22.928C45.5702 22.928 46.3547 23.0348 47.1017 23.2328C44.9017 21.0977 41.9016 19.7829 38.5935 19.7829C35.2196 19.7829 32.1652 21.1501 29.9551 23.3609C27.7443 25.5718 26.3771 28.6263 26.3771 32.0003C26.3771 35.3743 27.7443 38.4289 29.9551 40.639C32.1658 42.8499 35.2203 44.2171 38.5935 44.2171C41.9016 44.2171 44.9024 42.9022 47.1017 40.7672C46.3554 40.9659 45.5708 41.0719 44.7621 41.0719C42.2573 41.0719 39.9888 40.0565 38.3479 38.4148C36.7062 36.7731 35.6907 34.5045 35.6907 31.9997C35.6907 29.4948 36.7062 27.2262 38.3479 25.5846C39.9882 23.9442 42.256 22.928 44.7614 22.928ZM49.038 27.7236C47.9434 26.6296 46.4312 25.9524 44.7607 25.9524C43.0902 25.9524 41.5781 26.6296 40.4835 27.7236C39.3888 28.8183 38.7123 30.3304 38.7123 32.001C38.7123 33.6716 39.3895 35.1837 40.4835 36.2784C41.5781 37.3724 43.0902 38.0496 44.7607 38.0496C46.4312 38.0496 47.9434 37.3724 49.038 36.2784C50.132 35.1837 50.8092 33.6716 50.8092 32.001L50.8085 31.9231C50.7884 30.2828 50.1152 28.8008 49.038 27.7236ZM38.5928 16.7593C40.4929 16.7593 42.311 17.1069 43.9889 17.7425C40.8472 15.2082 36.8505 13.6906 32.5001 13.6906C27.4443 13.6906 22.8663 15.7404 19.5528 19.0533C16.24 22.3663 14.1903 26.9444 14.1903 32.0003C14.1903 37.057 16.2393 41.6344 19.5528 44.948C22.8663 48.2609 27.4436 50.3107 32.5001 50.3107C36.8512 50.3107 40.8472 48.7932 43.9889 46.2581C42.311 46.8937 40.4929 47.2414 38.5928 47.2414C34.3847 47.2414 30.5739 45.5353 27.8168 42.7774C25.059 40.0195 23.3529 36.2093 23.3529 32.001C23.3529 27.7927 25.059 23.9818 27.8168 21.2239C30.5739 18.4654 34.3847 16.7593 38.5928 16.7593Z"
      fill="white"
    />
  </Svg>
);

export const Swap = ({style, color}: SvgProps) => (
  <Svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    style={style}
    color={color}>
    <Path
      d="M13.7418 6.70225C14.089 7.04938 14.6518 7.04938 14.9989 6.70225L15.8519 5.84931L15.8519 17.9256C15.8519 18.4165 16.2498 18.8145 16.7407 18.8145C17.2317 18.8145 17.6296 18.4165 17.6296 17.9256L17.6296 5.84931L18.4826 6.70225C18.8297 7.04938 19.3925 7.04938 19.7396 6.70225C20.0868 6.35512 20.0868 5.7923 19.7396 5.44517L17.3693 3.0748C17.0221 2.72767 16.4593 2.72767 16.1122 3.0748L13.7418 5.44517C13.3947 5.79231 13.3947 6.35512 13.7418 6.70225Z"
      fill="currentColor"
    />
    <Path
      d="M8.14815 18.15L9.00109 17.297C9.34822 16.9499 9.91104 16.9499 10.2582 17.297C10.6053 17.6442 10.6053 18.207 10.2582 18.5541L7.8878 20.9245C7.54067 21.2716 6.97785 21.2716 6.63072 20.9245L4.26035 18.5541C3.91322 18.207 3.91322 17.6442 4.26035 17.297C4.60748 16.9499 5.1703 16.9499 5.51743 17.297L6.37037 18.15L6.37037 6.07371C6.37037 5.58279 6.76834 5.18482 7.25926 5.18482C7.75018 5.18482 8.14815 5.58279 8.14815 6.07371L8.14815 18.15Z"
      fill="currentColor"
    />
  </Svg>
);

export const QRCode = ({style, color}: SvgProps) => (
  <Svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={style}
    color={color}>
    <Path
      d="M3.12544 7.51177H5.71958C6.93297 7.51177 7.51177 6.93995 7.51177 5.70564V3.14636C7.51177 1.91205 6.93297 1.33325 5.71958 1.33325H3.12544C1.91205 1.33325 1.33325 1.91205 1.33325 3.14636V5.70564C1.33325 6.93995 1.91205 7.51177 3.12544 7.51177ZM10.2803 7.51177H12.8744C14.0878 7.51177 14.6666 6.93995 14.6666 5.70564V3.14636C14.6666 1.91205 14.0878 1.33325 12.8744 1.33325H10.2803C9.06686 1.33325 8.48806 1.91205 8.48806 3.14636V5.70564C8.48806 6.93995 9.06686 7.51177 10.2803 7.51177ZM3.03479 6.20076C2.76282 6.20076 2.64427 6.07523 2.64427 5.80327V3.04176C2.64427 2.76979 2.76282 2.64427 3.03479 2.64427H5.81024C6.07523 2.64427 6.20076 2.76979 6.20076 3.04176V5.80327C6.20076 6.07523 6.07523 6.20076 5.81024 6.20076H3.03479ZM10.1896 6.20076C9.91763 6.20076 9.79908 6.07523 9.79908 5.80327V3.04176C9.79908 2.76979 9.91763 2.64427 10.1896 2.64427H12.9651C13.237 2.64427 13.3556 2.76979 13.3556 3.04176V5.80327C13.3556 6.07523 13.237 6.20076 12.9651 6.20076H10.1896ZM3.75306 5.24539H5.085C5.19657 5.24539 5.24539 5.20354 5.24539 5.06407V3.77398C5.24539 3.64845 5.19657 3.59964 5.085 3.59964H3.75306C3.63451 3.59964 3.59964 3.64845 3.59964 3.77398V5.06407C3.59964 5.20354 3.63451 5.24539 3.75306 5.24539ZM10.9288 5.24539H12.2607C12.3793 5.24539 12.4281 5.20354 12.4281 5.06407V3.77398C12.4281 3.64845 12.3793 3.59964 12.2607 3.59964H10.9288C10.8172 3.59964 10.7754 3.64845 10.7754 3.77398V5.06407C10.7754 5.20354 10.8172 5.24539 10.9288 5.24539ZM3.12544 14.6666H5.71958C6.93297 14.6666 7.51177 14.0948 7.51177 12.8604V10.3012C7.51177 9.06686 6.93297 8.48806 5.71958 8.48806H3.12544C1.91205 8.48806 1.33325 9.06686 1.33325 10.3012V12.8604C1.33325 14.0948 1.91205 14.6666 3.12544 14.6666ZM9.0041 10.4476H10.336C10.4546 10.4476 10.5034 10.4058 10.5034 10.2663V8.97621C10.5034 8.85069 10.4546 8.80187 10.336 8.80187H9.0041C8.89253 8.80187 8.85069 8.85069 8.85069 8.97621V10.2663C8.85069 10.4058 8.89253 10.4476 9.0041 10.4476ZM12.7907 10.4476H14.1227C14.2412 10.4476 14.283 10.4058 14.283 10.2663V8.97621C14.283 8.85069 14.2412 8.80187 14.1227 8.80187H12.7907C12.6791 8.80187 12.6373 8.85069 12.6373 8.97621V10.2663C12.6373 10.4058 12.6791 10.4476 12.7907 10.4476ZM3.03479 13.3556C2.76282 13.3556 2.64427 13.23 2.64427 12.9651V10.2035C2.64427 9.9246 2.76282 9.79908 3.03479 9.79908H5.81024C6.07523 9.79908 6.20076 9.9246 6.20076 10.2035V12.9651C6.20076 13.23 6.07523 13.3556 5.81024 13.3556H3.03479ZM10.9148 12.3444H12.2468C12.3653 12.3444 12.4141 12.2956 12.4141 12.1631V10.866C12.4141 10.7405 12.3653 10.6917 12.2468 10.6917H10.9148C10.8033 10.6917 10.7614 10.7405 10.7614 10.866V12.1631C10.7614 12.2956 10.8033 12.3444 10.9148 12.3444ZM3.75306 12.4002H5.085C5.19657 12.4002 5.24539 12.3584 5.24539 12.2189V10.9288C5.24539 10.8033 5.19657 10.7545 5.085 10.7545H3.75306C3.63451 10.7545 3.59964 10.8033 3.59964 10.9288V12.2189C3.59964 12.3584 3.63451 12.4002 3.75306 12.4002ZM9.0041 14.2342H10.336C10.4546 14.2342 10.5034 14.1854 10.5034 14.0529V12.7628C10.5034 12.6303 10.4546 12.5885 10.336 12.5885H9.0041C8.89253 12.5885 8.85069 12.6303 8.85069 12.7628V14.0529C8.85069 14.1854 8.89253 14.2342 9.0041 14.2342ZM12.7907 14.2342H14.1227C14.2412 14.2342 14.283 14.1854 14.283 14.0529V12.7628C14.283 12.6303 14.2412 12.5885 14.1227 12.5885H12.7907C12.6791 12.5885 12.6373 12.6303 12.6373 12.7628V14.0529C12.6373 14.1854 12.6791 14.2342 12.7907 14.2342Z"
      fill="currentColor"
    />
  </Svg>
);

export const QRScanner = ({style, color}: SvgProps) => (
  <Svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    style={style}
    color={color}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 8C4 8.55228 3.55228 9 3 9C2.44772 9 2 8.55228 2 8V6C2 3.79086 3.79086 2 6 2H8C8.55228 2 9 2.44772 9 3C9 3.55228 8.55228 4 8 4H6C4.89543 4 4 4.89543 4 6V8ZM16 4C15.4477 4 15 3.55228 15 3C15 2.44772 15.4477 2 16 2H18C20.2091 2 22 3.79086 22 6V8C22 8.55228 21.5523 9 21 9C20.4477 9 20 8.55228 20 8V6C20 4.89543 19.1046 4 18 4H16ZM2 16C2 15.4477 2.44772 15 3 15C3.55228 15 4 15.4477 4 16V18C4 19.1046 4.89543 20 6 20H8C8.55228 20 9 20.4477 9 21C9 21.5523 8.55228 22 8 22H6C3.79086 22 2 20.2091 2 18V16ZM20 16C20 15.4477 20.4477 15 21 15C21.5523 15 22 15.4477 22 16V18C22 20.2091 20.2091 22 18 22H16C15.4477 22 15 21.5523 15 21C15 20.4477 15.4477 20 16 20H18C19.1046 20 20 19.1046 20 18V16ZM7.5 7.5V9.5H9.5V7.5H7.5ZM7 6C6.44772 6 6 6.44772 6 7V10C6 10.5523 6.44772 11 7 11H10C10.5523 11 11 10.5523 11 10V7C11 6.44772 10.5523 6 10 6H7ZM7.5 16.5V14.5H9.5V16.5H7.5ZM6 14C6 13.4477 6.44772 13 7 13H10C10.5523 13 11 13.4477 11 14V17C11 17.5523 10.5523 18 10 18H7C6.44772 18 6 17.5523 6 17V14ZM14.5 7.5V9.5H16.5V7.5H14.5ZM14 6C13.4477 6 13 6.44772 13 7V10C13 10.5523 13.4477 11 14 11H17C17.5523 11 18 10.5523 18 10V7C18 6.44772 17.5523 6 17 6H14ZM13 13.5C13 13.2239 13.2239 13 13.5 13H14.5C14.7761 13 15 13.2239 15 13.5V14.5C15 14.7761 14.7761 15 14.5 15H13.5C13.2239 15 13 14.7761 13 14.5V13.5ZM16.5 16C16.2239 16 16 16.2239 16 16.5V17.5C16 17.7761 16.2239 18 16.5 18H17.5C17.7761 18 18 17.7761 18 17.5V16.5C18 16.2239 17.7761 16 17.5 16H16.5ZM16 13.5C16 13.2239 16.2239 13 16.5 13H17.5C17.7761 13 18 13.2239 18 13.5V14.5C18 14.7761 17.7761 15 17.5 15H16.5C16.2239 15 16 14.7761 16 14.5V13.5ZM13.5 16C13.2239 16 13 16.2239 13 16.5V17.5C13 17.7761 13.2239 18 13.5 18H14.5C14.7761 18 15 17.7761 15 17.5V16.5C15 16.2239 14.7761 16 14.5 16H13.5Z"
      fill="currentColor"
    />
  </Svg>
);
