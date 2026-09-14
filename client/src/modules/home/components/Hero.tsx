import { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  Play,
  TrendingUp,
  Building2
} from 'lucide-react';

interface HeroProps {
  onCtaClick?: () => void;
}

export function Hero({ onCtaClick }: HeroProps) {
  const [activeTab, setActiveTab] = useState<'normativa' | 'auditoria' | 'seguridad'>('normativa');

  return (
    <section 
      className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 text-slate-100"
      style={{ backgroundColor: 'var(--main-color)' }}
    >
      {/* Luces Ambientales basadas en tus colores de soporte */}
      <div 
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: 'var(--support-light)' }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ backgroundColor: 'var(--secondary-color)' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Badge Superior: Compliance y Calidad */}
        <div className="flex justify-center lg:justify-start">
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-8 border backdrop-blur-md shadow-sm"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: 'var(--text-secondary-color)'
            }}
          >
            <ShieldCheck size={16} style={{ color: 'var(--accent-color)' }} />
            <span>Consultoría en Cumplimiento Normativo & Habilitación Sanitaria</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* COLUMNA IZQUIERDA: Titular y CTA */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6 text-white brand-font">
              Transformamos la <span className="gradient-text">Gestión Clínica</span> en Excelencia
            </h1>
            
            <p className="text-base sm:text-xl max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed mb-8 text-slate-300">
              Asesoramos a IPS, clínicas y hospitales en procesos de habilitación, auditoría médica, seguridad del paciente y optimización de procesos de calidad.
            </p>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
              <button 
                onClick={onCtaClick}
                className="btn-main w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Solicitar Diagnóstico Institucional</span>
                <ArrowRight size={18} />
              </button>

              <a 
                href="#casos-exito"
                className="secondary-gradient-button w-full sm:w-auto px-7 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2"
              >
                <Play size={16} />
                <span>Ver Servicios</span>
              </a>
            </div>

            {/* Métricas Principales */}
            <div className="pt-8 border-t border-slate-700/60 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white brand-font">100%</p>
                <p className="text-xs sm:text-sm text-slate-300">Acompañamiento Normativo</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white brand-font">+150</p>
                <p className="text-xs sm:text-sm text-slate-300">Auditorías Realizadas</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white brand-font">0%</p>
                <p className="text-xs sm:text-sm text-slate-300">Riesgo de Sanción</p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Consola de Gestión Interactiva */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Panel Principal */}
              <div 
                className="backdrop-blur-xl border rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  borderColor: 'rgba(255, 255, 255, 0.15)' 
                }}
              >
                <div className="flex items-center justify-between pb-6 border-b border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-xl text-white"
                      style={{ backgroundColor: 'var(--secondary-color)' }}
                    >
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base brand-font">Módulo de Calidad Sanitaria</h3>
                      <p className="text-xs text-slate-300">Seguimiento y Control Interno</p>
                    </div>
                  </div>
                  <span 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ 
                      backgroundColor: 'rgba(2, 173, 189, 0.2)', 
                      color: 'var(--support-light)',
                      border: '1px solid var(--support-light)'
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    En Monitoreo
                  </span>
                </div>

                {/* Filtros de Pestañas */}
                <div className="my-6 grid grid-cols-3 gap-1 bg-slate-900/60 p-1 rounded-xl text-xs font-medium">
                  <button 
                    onClick={() => setActiveTab('normativa')}
                    className={`py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'normativa' 
                        ? 'bg-slate-800 text-white font-semibold shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Normativa
                  </button>
                  <button 
                    onClick={() => setActiveTab('auditoria')}
                    className={`py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'auditoria' 
                        ? 'bg-slate-800 text-white font-semibold shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Auditoría
                  </button>
                  <button 
                    onClick={() => setActiveTab('seguridad')}
                    className={`py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'seguridad' 
                        ? 'bg-slate-800 text-white font-semibold shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Seguridad
                  </button>
                </div>

                {/* Contenido según Pestaña */}
                <div className="space-y-3">
                  {activeTab === 'normativa' && (
                    <>
                      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={18} style={{ color: 'var(--support-light)' }} />
                          <span className="text-sm text-slate-200">Estándares de Habilitación</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--support-light)' }}>Verificado</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={18} style={{ color: 'var(--support-light)' }} />
                          <span className="text-sm text-slate-200">Gestión Documental</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--support-light)' }}>Al día</span>
                      </div>
                    </>
                  )}

                  {activeTab === 'auditoria' && (
                    <>
                      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TrendingUp size={18} style={{ color: 'var(--accent-color)' }} />
                          <span className="text-sm text-slate-200">Auditoría de Historias Clínicas</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--accent-color)' }}>Conforme</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={18} style={{ color: 'var(--support-light)' }} />
                          <span className="text-sm text-slate-200">Plan PAMEC</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--support-light)' }}>En Ejecución</span>
                      </div>
                    </>
                  )}

                  {activeTab === 'seguridad' && (
                    <>
                      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 size={18} style={{ color: 'var(--support-light)' }} />
                          <span className="text-sm text-slate-200">Reporte de Eventos Adversos</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--support-light)' }}>Sistematizado</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={18} style={{ color: 'var(--support-light)' }} />
                          <span className="text-sm text-slate-200">Protocolos de Bioseguridad</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--support-light)' }}>Vigente</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
                  <a 
                    href="/contacto" 
                    className="text-xs font-semibold transition-colors inline-flex items-center gap-1"
                    style={{ color: 'var(--support-light)' }}
                  >
                    Consultar evaluación para mi institución &rarr;
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}