/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { CustomCursor } from './components/CustomCursor';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { PageTransitionProvider } from './components/PageTransition';
import { ReadingSurfaceProvider } from './components/ReadingSurfaceContext';
import { SmoothScrollProvider } from './components/SmoothScrollProvider';
import { AmbientSoundProvider } from './context/AmbientSoundContext';
import { LanguageProvider } from './context/LanguageContext';
import { ArchivePage } from './pages/ArchivePage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PoemDetailPage } from './pages/PoemDetailPage';

export default function App() {
  return (
    <LanguageProvider>
      <AmbientSoundProvider>
        <HashRouter>
        <ReadingSurfaceProvider>
          <SmoothScrollProvider>
            <PageTransitionProvider>
              <div className="twilight-atmosphere-grain relative flex min-h-screen flex-col overflow-x-clip text-[#F6F4EF]">
                <AmbientBackdrop />
                <CustomCursor />
                <Navbar />
                <main className="relative z-10 flex-1 overflow-x-clip">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/poems" element={<ArchivePage />} />
                    <Route path="/poems/:slug" element={<PoemDetailPage />} />
                    <Route
                      path="/about"
                      element={<Navigate to="/#chapter-story" replace />}
                    />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </PageTransitionProvider>
          </SmoothScrollProvider>
        </ReadingSurfaceProvider>
        </HashRouter>
      </AmbientSoundProvider>
    </LanguageProvider>
  );
}
