'use client'

import { useEffect } from 'react'
import { hasFlag } from './lib/utils/url'
import { useLifecycle } from './hooks/useLifecycle'
import { usePlatformFixes } from './hooks/usePlatformFixes'
import { useScrollEvents } from './hooks/useScrollEvents'
import { useSections } from './hooks/useSections'
import { useReorder } from './hooks/useReorder'
import { useDeferredImages } from './hooks/useDeferredImages'
import { useOnVisible } from './hooks/useOnVisible'
import { useSlideshows } from './hooks/useSlideshows'
import { useTerminal } from './hooks/useTerminal'

export default function Home() {
  const scrollEvents = useScrollEvents()

  useLifecycle()
  usePlatformFixes()
  useSections()
  useReorder()
  useOnVisible(scrollEvents)
  useDeferredImages(scrollEvents)
  useSlideshows(scrollEvents)
  useTerminal(scrollEvents)

  useEffect(() => {
    if (hasFlag('enable_legacy_port')) {
      const loadLegacyPort = async (): Promise<void> => {
        try {
          const { runLegacyPort } = await import('./lib/compat/legacyPort')
          runLegacyPort()
        } catch (error) {
          console.error('[bootstrap] failed to load legacy_port:', error)
        }
      }
      loadLegacyPort()
    }
  }, [])

  useEffect(() => {
    const unstuckHeroIfHidden = (): void => {
      const el = document.querySelector<HTMLElement>('#text05')
      if (!el) return
      const opacity = getComputedStyle(el).opacity
      if (opacity === '0') {
        el.style.opacity = '1'
        el.style.transform = 'none'
      }
    }

    setTimeout(unstuckHeroIfHidden, 0)
    setTimeout(unstuckHeroIfHidden, 600)
    setTimeout(unstuckHeroIfHidden, 100)
  }, [])

  return (
    <>
      <svg display="none" height="0" version="1.1" viewBox="0 0 40 40" width="0" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        <symbol id="icon-a63c85b2b6ee333b6d6753e57c8dfe0a" viewBox="0 0 40 40">
          <path d="M20,0.5c-11,0-20,9-20,20c0,8.8,5.7,16.3,13.7,18.9c1,0.2,1.4-0.4,1.4-0.9c0-0.5,0-1.9,0-3.7c-5.5,1.2-6.7-2.7-6.7-2.7 c-0.9-2.3-2.2-2.9-2.2-2.9c-1.8-1.2,0.1-1.2,0.1-1.2c2,0.1,3,2.1,3,2.1c1.8,3.1,4.7,2.2,5.9,1.7c0.2-1.3,0.7-2.2,1.3-2.7 c-4.5-0.5-9.2-2.3-9.2-10.1c0-2.2,0.8-4.1,2.1-5.5c-0.2-0.5-0.9-2.6,0.2-5.4c0,0,1.7-0.5,5.6,2.1c1.6-0.4,3.3-0.6,5-0.6 c1.7,0,3.4,0.2,5,0.6c3.9-2.6,5.6-2.1,5.6-2.1c1.1,2.8,0.4,4.9,0.2,5.4c1.3,1.4,2.1,3.3,2.1,5.5c0,7.8-4.7,9.6-9.2,10.1 c0.7,0.6,1.4,1.9,1.4,3.8c0,2.7,0,4.9,0,5.6c0,0.5,0.4,1.1,1.4,0.9C34.3,36.8,40,29.3,40,20.5C40,9.5,31,0.5,20,0.5z"></path>
        </symbol>
        <symbol id="icon-3b7eeeccbb457780f277fce4669f67a0" viewBox="0 0 40 40">
          <path d="M33.2,8.3c-2.5-1.1-5.1-1.9-7.9-2.4c-0.3,0.6-0.7,1.4-1,2c-2.9-0.4-5.8-0.4-8.7,0c-0.3-0.6-0.7-1.4-1-2 c-2.8,0.5-5.4,1.3-7.9,2.4c-5,7.2-6.3,14.2-5.6,21.1c3.3,2.3,6.5,3.8,9.6,4.7c0.8-1,1.5-2.1,2.1-3.3c-1.1-0.4-2.2-0.9-3.2-1.5 c0.3-0.2,0.5-0.4,0.8-0.6c6.3,2.8,13,2.8,19.2,0c0.3,0.2,0.5,0.4,0.8,0.6c-1,0.6-2.1,1.1-3.2,1.5c0.6,1.1,1.3,2.2,2.1,3.3 c3.1-0.9,6.3-2.4,9.6-4.7C39.7,21.4,37.5,14.4,33.2,8.3z M13.7,25.1c-1.9,0-3.4-1.7-3.4-3.7s1.5-3.7,3.4-3.7c1.9,0,3.5,1.7,3.4,3.7 C17.1,23.4,15.6,25.1,13.7,25.1z M26.3,25.1c-1.9,0-3.4-1.7-3.4-3.7s1.5-3.7,3.4-3.7c1.9,0,3.5,1.7,3.4,3.7 C29.7,23.4,28.2,25.1,26.3,25.1z"></path>
        </symbol>
        <symbol id="icon-31b8880d36499db40d4e47546c4763f3" viewBox="0 0 40 40">
          <path d="M30.1,4h5.4L23.7,17.6L37.6,36H26.7l-8.5-11.2L8.5,36H3.1l12.6-14.5L2.4,4h11.1l7.7,10.2L30.1,4z M28.2,32.8h3L11.9,7.1H8.7 L28.2,32.8z"></path>
        </symbol>
        <symbol id="icon-c0646d28bbeb18e39eb973f96b44bd0f" viewBox="0 0 40 40">
          <path d="M34.9,30.5V15.6c-0.4,0.4-0.8,0.9-1.4,1.2c-3.4,2.7-6.2,4.8-8.2,6.6c-0.6,0.5-1.1,0.9-1.6,1.2c-0.4,0.3-0.9,0.6-1.7,0.9 c-0.7,0.3-1.4,0.5-2,0.5l0,0c-0.6,0-1.2-0.2-2-0.5c-0.7-0.3-1.2-0.6-1.7-0.9c-0.4-0.3-0.9-0.7-1.6-1.2c-2.1-1.7-4.8-3.8-8.2-6.6 c-0.5-0.4-0.9-0.8-1.4-1.2v14.9c0,0.2,0.1,0.3,0.2,0.4C5.7,31,5.9,31.1,6,31.1h28.4c0.2,0,0.3-0.1,0.4-0.2 C34.8,30.8,34.9,30.7,34.9,30.5L34.9,30.5z M34.9,10.2V9.7c0,0,0-0.1,0-0.2c0-0.1,0-0.2-0.1-0.2c-0.1,0-0.1,0-0.1-0.2 c0-0.1-0.1-0.2-0.2-0.1c-0.1,0-0.2,0-0.3,0H5.8C5.6,8.9,5.4,9,5.3,9.1C5.2,9.2,5.1,9.3,5.1,9.5c0,2.2,0.9,4,2.8,5.5 c2.5,2,5.1,4,7.7,6.1c0.1,0.1,0.3,0.2,0.7,0.5c0.4,0.3,0.6,0.5,0.9,0.7c0.2,0.2,0.5,0.4,0.8,0.6c0.3,0.2,0.7,0.4,0.9,0.5 c0.3,0.1,0.6,0.2,0.8,0.2l0,0c0.2,0,0.5-0.1,0.8-0.2c0.3-0.1,0.6-0.3,0.9-0.5c0.3-0.2,0.6-0.4,0.8-0.6c0.2-0.2,0.5-0.4,0.9-0.7 c0.4-0.3,0.6-0.5,0.6-0.5c2.7-2.1,5.3-4.2,7.7-6.1c0.7-0.5,1.4-1.2,2-2.2C34.6,11.8,34.9,11,34.9,10.2L34.9,10.2z M37.3,9.5v21 c0,0.8-0.3,1.6-0.9,2.2s-1.4,0.9-2.2,0.9H5.8c-0.8,0-1.6-0.3-2.2-0.9c-0.6-0.6-0.9-1.4-0.9-2.2v-21c0-0.8,0.3-1.6,0.9-2.2 s1.4-0.9,2.2-0.9h28.4c0.8,0,1.6,0.3,2.2,0.9S37.3,8.7,37.3,9.5z"></path>
        </symbol>
      </svg>
      <div id="wrapper">
        <div id="main">
          <div className="inner">
            <section id="main-section">
              <div className="container columns" id="container03">
                <div className="wrapper">
                  <div className="inner" data-reorder="1,0">
                    <div>
                    </div>
                    <div><hr id="divider01"/></div>
                  </div>
                </div>
              </div>
              <div className="container columns" id="container06">
                <div className="wrapper">
                  <div className="inner">
                    <div>
                      <p id="text05">Software Developer &amp; AI Engineering</p>
                      <h1 id="text06">Reina MacCredy</h1>
                    </div>
                    <div>
                      <ul className="icons" id="icons01">
                        <li>
                          <a className="n01" href="https://github.com/ReinaMacCredy" role="button">
                            <svg aria-labelledby="icons01-icon-1-title">
                              <title id="icons01-icon-1-title">GitHub</title>
                              <use href="#icon-a63c85b2b6ee333b6d6753e57c8dfe0a"></use>
                            </svg>
                            <span className="label">GitHub</span>
                          </a>
                        </li>
                        <li>
                          <a className="n02" href="https://discordapp.com/users/970626073199005717" role="button">
                            <svg aria-labelledby="icons01-icon-2-title">
                              <title id="icons01-icon-2-title">Discord</title>
                              <use href="#icon-3b7eeeccbb457780f277fce4669f67a0"></use>
                            </svg>
                            <span className="label">Discord</span>
                          </a>
                        </li>
                        <li>
                          <a className="n03" href="https://x.com/ReinaMacCredy" role="button">
                            <svg aria-labelledby="icons01-icon-3-title">
                              <title id="icons01-icon-3-title">X</title>
                              <use href="#icon-31b8880d36499db40d4e47546c4763f3"></use>
                            </svg>
                            <span className="label">Twitter</span>
                          </a>
                        </li>
                        <li>
                          <a className="n04" href="mailto:reina.maccredy@outlook.com" role="button">
                            <svg aria-labelledby="icons01-icon-4-title">
                              <title id="icons01-icon-4-title">Email</title>
                              <use href="#icon-c0646d28bbeb18e39eb973f96b44bd0f"></use>
                            </svg>
                            <span className="label">Email</span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="container default" id="container05">
                <div className="wrapper">
                  <div className="inner">
                    <div id="terminal-container"></div>
                  </div>
                </div>
              </div>
              <div className="container columns" id="container01">
                <div className="wrapper">
                  <div className="inner">
                    <div>
                      <div className="image" data-position="top left" id="image04">
                        <span className="frame">
                          <img 
                            alt="" 
                            onContextMenu={(e) => e.preventDefault()} 
                            onDragStart={(e) => e.preventDefault()} 
                            src="/assets/images/image04.webp?v=9ba4655d"
                          />
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="image" data-position="top right" id="image05">
                        <span className="frame">
                          <img 
                            alt="" 
                            onContextMenu={(e) => e.preventDefault()} 
                            onDragStart={(e) => e.preventDefault()} 
                            src="/assets/images/image05.webp?v=9ba4655d"
                          />
                        </span>
                      </div>
                      <ul className="links" id="links02">
                        <li className="n01"><a href="https://github.com/ReinaMacCredy">GitHub</a></li>
                        <li className="n02"><a href="https://discordapp.com/users/970626073199005717">Discord</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <h2 id="text01">I'M AN</h2>
              <p id="text02">AI Engineering & Software Engineering! Welcome to my digital realm~</p>
              <div className="inner">
                <p id="text07">
                  <span className="p">
                    There's a saying — the more demanding the diner, the stronger the skills of the chef... but no matter what others say, I'll always be demanding more from myself.
                  </span>
                </p>
              </div>
            </section>
          </div>
        </div>
        <p id="text03">&nbsp;</p>
      </div>
    </>
  )
}

