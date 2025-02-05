
import { Swiper, SwiperSlide } from 'swiper/react';


import 'swiper/css';
import 'swiper/css/effect-creative'

import {EffectCreative} from 'swiper'
import React from 'react'
import Banner1 from './Banner1';
import Banner2 from './Banner2';

const BannerContainer = () => {
  return (
    <section>
        <Swiper
            grabCursor={true}
            effect={'creative'}
            creativeEffect={{
                prev: {
                    shadow: true,
                    translate: ['-120%', 0, -500]
                },
                next: {
                    shadow:true,
                    translate: ['120%', 0, -500]
                }
            }}
            modules={[EffectCreative]}
            className='mySwiper5'
            loop={true}
            autoplay={
                {
                    delay: 250,
                    disableOnInteraction: false
                }
            }
            
        >
            <SwiperSlide>
                <Banner1 />
            </SwiperSlide>
            <SwiperSlide>
                <Banner2 />
            </SwiperSlide>
        </Swiper>
    </section>
  )
}

export default BannerContainer