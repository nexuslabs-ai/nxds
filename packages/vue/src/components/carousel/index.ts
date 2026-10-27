import type { EmblaCarouselVueType } from 'embla-carousel-vue';
import { inject, type InjectionKey, type Ref, type UnwrapRef } from 'vue';

export { default as Carousel, type CarouselProps } from './Carousel.vue';
export {
  default as CarouselContent,
  type CarouselContentProps,
} from './CarouselContent.vue';
export {
  default as CarouselItem,
  type CarouselItemProps,
} from './CarouselItem.vue';
export {
  default as CarouselNext,
  type CarouselNextProps,
} from './CarouselNext.vue';
export {
  default as CarouselPrevious,
  type CarouselPreviousProps,
} from './CarouselPrevious.vue';

export type CarouselApi = NonNullable<UnwrapRef<EmblaCarouselVueType[1]>>;

export const CarouselKey: InjectionKey<{
  carouselRef: EmblaCarouselVueType[0];
  orientation: Ref<'horizontal' | 'vertical'>;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: Ref<boolean>;
  canScrollNext: Ref<boolean>;
}> = Symbol('carousel');

/** The state the Carousel provides to its parts. */
export function injectCarousel() {
  const carousel = inject(CarouselKey);
  if (!carousel) {
    throw new Error('Carousel parts must be used within a <Carousel />');
  }
  return carousel;
}

export const carouselControlClasses =
  'nx:absolute nx:rounded-full nx:after:absolute nx:after:-inset-2';
