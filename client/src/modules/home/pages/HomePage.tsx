import { Hero } from '../components/Hero';
import { 
  ShieldAlert, 
  FileCheck2, 
  Stethoscope, 
  Users, 
  ArrowRight,
  Sparkles,
  Lock,
  BarChart3,
  Building
} from 'lucide-react';

function HomePage() {
  const handleOpenContact = () => {
    window.location.href = '/contacto';
  };

  return (
    <div className="min-h-screen bg-main-color" >
      
      {/* HERO PRINCIPAL */}
      <Hero onCtaClick={handleOpenContact} />

      {/* SECCIÓN 1: Tipos de Instituciones que Asesoramos */}
      <section className="py-10 bg-white border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            Asesoría especializada para Prestadores de Servicios de Salud
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-80">
            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm sm:text-base">
              <Building size={20} style={{ color: 'var(--main-color)' }} /> IPS Consultorios
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm sm:text-base">
              <Building size={20} style={{ color: 'var(--secondary-color)' }} /> Clínicas Especializadas
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm sm:text-base">
              <Building size={20} style={{ color: 'var(--support-dark)' }} /> Hospitales de Media y Alta Complejidad
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm sm:text-base">
              <Building size={20} style={{ color: 'var(--main-color)' }} /> Centros Diagnósticos
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: Servicios Principales */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span 
              className="text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full border"
              style={{ 
                backgroundColor: 'rgba(26, 30, 82, 0.05)', 
                color: 'var(--main-color)',
                borderColor: 'rgba(26, 30, 82, 0.15)'
              }}
            >
              Nuestros Servicios
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 mb-4 brand-font text-slate-900">
              Soluciones Integrales en Calidad Sanitaria
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Estructuramos y mantenemos su sistema de gestión de calidad en salud para garantizar un cumplimiento normativo transparente y seguro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Servicio 1 */}
            <div className="bg-white rounded-2xl p-8 border shadow-sm hover:shadow-xl transition-all duration-300 group" style={{ borderColor: 'var(--border-color)' }}>
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors"
                style={{ 
                  backgroundColor: 'rgba(26, 30, 82, 0.08)', 
                  color: 'var(--main-color)' 
                }}
              >
                <FileCheck2 size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 brand-font text-slate-900">Habilitación de Servicios</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Preparación, autoevaluación y soporte continuo en las condiciones de capacidad tecnológica, científica y administrativa.
              </p>
              <a href="/nosotros" className="text-sm font-bold inline-flex items-center gap-2" style={{ color: 'var(--secondary-color)' }}>
                Saber más <ArrowRight size={16} />
              </a>
            </div>

            {/* Servicio 2 */}
            <div className="bg-white rounded-2xl p-8 border shadow-sm hover:shadow-xl transition-all duration-300 group" style={{ borderColor: 'var(--border-color)' }}>
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors"
                style={{ 
                  backgroundColor: 'rgba(2, 173, 189, 0.1)', 
                  color: 'var(--support-dark)' 
                }}
              >
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 brand-font text-slate-900">Seguridad del Paciente & PAMEC</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Gestión de riesgos asistenciales, prevención de eventos adversos y diseño del Programa de Auditoría para la Mejora de la Calidad.
              </p>
              <a href="/nosotros" className="text-sm font-bold inline-flex items-center gap-2" style={{ color: 'var(--support-dark)' }}>
                Saber más <ArrowRight size={16} />
              </a>
            </div>

            {/* Servicio 3 */}
            <div className="bg-white rounded-2xl p-8 border shadow-sm hover:shadow-xl transition-all duration-300 group" style={{ borderColor: 'var(--border-color)' }}>
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors"
                style={{ 
                  backgroundColor: 'rgba(224, 161, 42, 0.12)', 
                  color: 'var(--accent-color)' 
                }}
              >
                <Stethoscope size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 brand-font text-slate-900">Auditoría Médica y Concurrente</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Evaluación de pertinencia médica, adherencia a guías clínicas y revisión técnica de registros en historias clínicas.
              </p>
              <a href="/nosotros" className="text-sm font-bold inline-flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
                Saber más <ArrowRight size={16} />
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* SECCIÓN 3: Enfoque de Trabajo */}
      <section className="py-20 text-white relative overflow-hidden" style={{ backgroundColor: 'var(--main-color)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <span 
                className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'var(--accent-color)'
                }}
              >
                Metodología de Trabajo
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-6 leading-tight brand-font">
                Procesos Claros para Resultados Sostenibles
              </h2>
              <p className="text-slate-300 text-base leading-relaxed mb-8">
                Trabajamos junto a su equipo asistencial y administrativo para crear una cultura de calidad continua que se mantenga en el tiempo.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-700/50">
                  <div className="p-2 rounded-lg mt-1" style={{ backgroundColor: 'var(--secondary-color)', color: '#fff' }}>
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-base brand-font">Diagnóstico Inicial</h4>
                    <p className="text-sm text-slate-300">Identificación clara de hallazgos y brechas respecto a la norma vigente.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-700/50">
                  <div className="p-2 rounded-lg mt-1" style={{ backgroundColor: 'var(--support-dark)', color: '#fff' }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-base brand-font">Acompañamiento a Equipos</h4>
                    <p className="text-sm text-slate-300">Entrenamiento práctico al talento humano para la adopción de procesos.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-700/50">
                  <div className="p-2 rounded-lg mt-1" style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}>
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-base brand-font">Verificación de Cumplimiento</h4>
                    <p className="text-sm text-slate-300">Simulacros de auditoría previos a visitas institucionales.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cuadro Resumen de Etapas */}
            <div className="bg-slate-900/70 p-8 rounded-3xl border border-slate-700 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
                <span className="text-sm font-bold text-slate-200 brand-font">Ruta de Acompañamiento</span>
                <Sparkles size={20} style={{ color: 'var(--accent-color)' }} />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm text-white"
                    style={{ backgroundColor: 'var(--secondary-color)' }}
                  >
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm brand-font">Autoevaluación de Estándares</h5>
                    <p className="text-xs text-slate-400">Revisión detallada de requisitos aplicables.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div 
                    className="w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm text-white"
                    style={{ backgroundColor: 'var(--secondary-color)' }}
                  >
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm brand-font">Plan de Acción y Correctivos</h5>
                    <p className="text-xs text-slate-400">Diseño de protocolos y ajustes necesarios.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div 
                    className="w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm text-white"
                    style={{ backgroundColor: 'var(--support-light)' }}
                  >
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm brand-font">Seguimiento y Cierre de Hallazgos</h5>
                    <p className="text-xs text-slate-400">Consolidación del expediente de calidad.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECCIÓN 4: Llamado a la Acción Final */}
      <section className="py-16 text-white text-center relative" style={{ backgroundImage: 'var(--main-gradient)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-white brand-font">
            ¿Requiere Asesoría en Calidad para su Institución?
          </h2>
          <p className="text-slate-200 text-base sm:text-lg mb-8 max-w-2xl mx-auto font-normal">
            Póngase en contacto con nuestro equipo de consultores para agendar una sesión inicial de diagnóstico.
          </p>
          <a
            href="/contacto"
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-white font-bold text-base shadow-xl transition-all hover:bg-slate-100"
            style={{ color: 'var(--main-color)' }}
          >
            <span>Contactar un Consultor</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

    </div>
  );
}

export {HomePage};