'use client';

import { useState } from 'react';
import { HelpCircle, X, Lightbulb, Target, Zap, BookOpen } from 'lucide-react';

export interface HelpContent {
  title: string;
  description: string;
  objective: string;
  howItWorks: string[];
  tips: string[];
  features?: string[];
}

interface HelpButtonProps {
  content: HelpContent;
}

export default function HelpButton({ content }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 z-40 w-12 h-12 bg-accent-info text-white rounded-full shadow-lg hover:bg-accent-info/90 transition-all flex items-center justify-center"
        title="Ajuda"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-neutral-border bg-gradient-to-r from-accent-info to-primary-main">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{content.title}</h2>
                    <p className="text-white/80 text-sm">Guia de ajuda</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Description */}
              <div>
                <p className="text-neutral-textPrimary leading-relaxed">
                  {content.description}
                </p>
              </div>

              {/* Objective */}
              <div className="bg-primary-main/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-primary-main" />
                  <h3 className="font-semibold text-neutral-textPrimary">Objetivo</h3>
                </div>
                <p className="text-neutral-textSecondary">
                  {content.objective}
                </p>
              </div>

              {/* How it works */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-secondary-main" />
                  <h3 className="font-semibold text-neutral-textPrimary">Como Funciona</h3>
                </div>
                <ol className="space-y-2">
                  {content.howItWorks.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-primary-main/10 rounded-full flex items-center justify-center text-sm font-medium text-primary-main flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-neutral-textSecondary">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Features */}
              {content.features && content.features.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-accent-success" />
                    <h3 className="font-semibold text-neutral-textPrimary">Funcionalidades</h3>
                  </div>
                  <ul className="grid grid-cols-2 gap-2">
                    {content.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-neutral-textSecondary">
                        <span className="w-1.5 h-1.5 bg-accent-success rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips */}
              <div className="bg-secondary-main/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-secondary-dark" />
                  <h3 className="font-semibold text-neutral-textPrimary">Dicas</h3>
                </div>
                <ul className="space-y-2">
                  {content.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-neutral-textSecondary">
                      <span className="text-secondary-dark">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-border bg-neutral-background">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-primary-main text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
              >
                Entendi!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
