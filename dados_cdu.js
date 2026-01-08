/**
 * BASE DE DADOS CDU (Classificação Decimal Universal)
 * Estrutura: Híbrida (Tabelas Auxiliares + Hierarquia Principal)
 * * Fonte das descrições principais: Lista fornecida pelo usuário.
 * Estrutura adaptada para o projeto 'Consulta CDD/CDU'.
 */

const baseCDU = {
    // 1. TABELAS AUXILIARES (Lugar, Tempo, Forma, Língua)
    // Adicionadas para exemplo, já que não estavam na lista original
    auxiliares: [
        { code: "(81)", desc: "Brasil (Lugar)" },
        { code: "(038)", desc: "Dicionários (Forma)" },
        { code: "(091)", desc: "História (Forma)" },
        { code: "(=134.3)", desc: "Língua Portuguesa" },
        { code: "(=111)", desc: "Língua Inglesa" },
        { code: "\"19\"", desc: "Século XX (Tempo)" },
        { code: "\"20\"", desc: "Século XXI (Tempo)" }
    ],

    // 2. TABELA PRINCIPAL (Hierárquica)
    principal: {
        "0": {
            desc: "Ciência e conhecimento. Organização. Informática. Informação. Documentação. Biblioteconomia. Instituições. Publicações",
            children: {
                "00": {
                    desc: "Prolegómenos. Fundamentos do conhecimento e da cultura. Propadéutica",
                    children: {
                        "001": {
                            desc: "Ciência e conhecimento em geral. Organização do trabalho intelectual",
                            children: {
                                "001.1": { desc: "Conceitos da ciência e do conhecimento", children: { "001.18": { desc: "Futuro do conhecimento" } } },
                                "001.32": { desc: "Sociedades eruditas, científicas. Academias" },
                                "001.8": { desc: "Metodologia", children: { "001.89": { desc: "Organização da ciência e do trabalho científico" } } },
                                "001.9": { desc: "Disseminação das ideias" }
                            }
                        },
                        "002": { desc: "Documentação. Livros. Escritos. Autoria" },
                        "003": {
                            desc: "Sistemas de escrita e escritas",
                            children: {
                                "003.01": { desc: "Origens, precursores da escrita. Formas primitivas de escrita" },
                                "003.02": { desc: "Aparecimento da escrita" },
                                "003.03": { desc: "Expressão gráfica da linguagem" },
                                "003.05": { desc: "Meios de produção de signos e escritas" },
                                "003.07": { desc: "Usos e estilos da escrita" },
                                "003.08": { desc: "Características da escrita" },
                                "003.09": { desc: "Técnicas e métodos de decifração de escritas" },
                                "003.2": {
                                    desc: "Sistemas de escrita. Representação gráfica de conceitos",
                                    children: {
                                        "003.21": { desc: "Escrita pictográfica" },
                                        "003.22": { desc: "Sistemas de escrita silábicos" },
                                        "003.23": { desc: "Sistemas de escrita alfabéticos" }
                                    }
                                },
                                "003.3": { desc: "Escritas" },
                                "003.5": { desc: "Materiais e equipamentos de escrita" },
                                "003.6": { desc: "Outros tipos de representação gráfica do pensamento" }
                            }
                        },
                        "004": {
                            desc: "Ciência e tecnologia informáticas. Computação. Processamento de dados",
                            children: {
                                "004.01": { desc: "Documentação" },
                                "004.02": { desc: "Métodos de resolução dos problemas" },
                                "004.03": { desc: "Tipos e características dos sistemas" },
                                "004.04": { desc: "Orientação do processamento" },
                                "004.05": { desc: "Qualidade dos sistemas e do software" },
                                "004.07": { desc: "Características da memória" },
                                "004.08": { desc: "Dispositivos de entrada (input), saída (output) e armazenamento" },
                                "004.2": {
                                    desc: "Arquitectura dos computadores",
                                    children: {
                                        "004.22": { desc: "Representação dos dados" },
                                        "004.23": { desc: "Arquitectura de conjunto de instruções" },
                                        "004.25": { desc: "Sistemas de memória" },
                                        "004.27": { desc: "Arquitecturas avançadas. Outras arquitecturas que a de Von Neumann" }
                                    }
                                },
                                "004.3": {
                                    desc: "Equipamento informático. Hardware",
                                    children: {
                                        "004.31": { desc: "Unidades de processamento. Circuitos de processamento" },
                                        "004.32": { desc: "Circuitos do computador" },
                                        "004.33": { desc: "Unidades da memória. Unidades de armazenamento" },
                                        "004.35": { desc: "Periféricos. Unidades de entrada e saída (input-output)" },
                                        "004.38": { desc: "Computador. Tipos de computador" }
                                    }
                                },
                                "004.4": {
                                    desc: "Programas de computador (software)",
                                    children: {
                                        "004.41": { desc: "Engenharia de software" },
                                        "004.42": { desc: "Programação de computadores. Programas de computador" },
                                        "004.43": { desc: "Linguagens de computador" },
                                        "004.45": { desc: "Programas de sistemas" },
                                        "004.49": { desc: "Infecções de computador" }
                                    }
                                },
                                "004.5": {
                                    desc: "Interacção homem-computador. Interface homem-máquina. Interface do utilizador",
                                    children: {
                                        "004.51": { desc: "Interface de exibição" },
                                        "004.52": { desc: "Interface de som" },
                                        "004.55": { desc: "Hipermédia. Hipertexto" },
                                        "004.58": { desc: "Ajuda ao utilizador" }
                                    }
                                },
                                "004.6": {
                                    desc: "Dados",
                                    children: {
                                        "004.62": { desc: "Tratamento de dados" },
                                        "004.63": { desc: "Ficheiros" },
                                        "004.65": { desc: "Bases de dados e suas estruturas" },
                                        "004.67": { desc: "Sistemas para dados numéricos" }
                                    }
                                },
                                "004.7": {
                                    desc: "Comunicação de computadores. Redes de computadores",
                                    children: {
                                        "004.71": { desc: "Equipamento para comunicação entre computadores" },
                                        "004.72": { desc: "Arquitectura de redes" },
                                        "004.73": { desc: "Redes de acordo com a área coberta", children: { "004.738": { desc: "Interconexão de redes" } } },
                                        "004.75": { desc: "Sistemas de processamento distribuído" },
                                        "004.77": { desc: "Aplicações e serviços gerais de rede" },
                                        "004.78": { desc: "Sistemas de computadores em linha para fins específicos" }
                                    }
                                },
                                "004.8": { desc: "Inteligência artificial" },
                                "004.9": {
                                    desc: "Técnicas baseadas em computadores e orientadas para aplicações",
                                    children: {
                                        "004.91": { desc: "Processamento e produção do documento" },
                                        "004.92": { desc: "Infografia. Computação gráfica" },
                                        "004.93": { desc: "Processamento de padrões de informação" },
                                        "004.94": { desc: "Simulação" }
                                    }
                                }
                            }
                        },
                        "005": {
                            desc: "Gestão",
                            children: {
                                "005.1": { desc: "Teoria da gestão" },
                                "005.2": { desc: "Agentes da gestão. Mecanismos. Medidas" },
                                "005.3": {
                                    desc: "Actividades de gestão",
                                    children: {
                                        "005.31": { desc: "Investigação operacional (IO)" },
                                        "005.32": { desc: "Comportamento organizacional. Psicologia da gestão" },
                                        "005.33": { desc: "Factores condicionantes da gestão" }
                                    }
                                },
                                "005.4": { desc: "Processos na gestão" },
                                "005.5": { desc: "Operações de gestão. Direcção" },
                                "005.6": { desc: "Gestão da qualidade. Gestão da qualidade total (TQM)" },
                                "005.7": { desc: "Gestão da organização" },
                                "005.9": {
                                    desc: "Áreas, campos da gestão",
                                    children: {
                                        "005.91": { desc: "Gestão administrativa. Secretariado" },
                                        "005.92": { desc: "Gestão de documentos de arquivo (gestão de registos)" },
                                        "005.93": { desc: "Gestão das instalações. Gestão dos recursos físicos" },
                                        "005.94": { desc: "Gestão de conhecimentos" },
                                        "005.95": { desc: "Gestão de pessoal. Gestão de recursos humanos" }
                                    }
                                }
                            }
                        },
                        "006": {
                            desc: "Normalização de produtos, operações, pesos, medidas e tempo",
                            children: {
                                "006.91": { desc: "Metrologia. Pesos e medidas em geral" },
                                "006.92": { desc: "Horologia. Determinação e normalização do tempo" }
                            }
                        },
                        "007": { desc: "Actividade e organização. Teoria da comunicação e do controlo (cibernética)", children: { "007.5": { desc: "Sistemas automáticos" } } },
                        "008": { desc: "Civilização. Cultura. Progresso" }
                    }
                },
                "01": {
                    desc: "Bibliografia e bibliografias. Catálogos",
                    children: {
                        "011": { desc: "Bibliografias universais e gerais" },
                        "012": { desc: "Bibliografias de autores. Bibliografias individuais" },
                        "013": { desc: "Bibliografias colectivas" },
                        "014": { desc: "Bibliografias de obras com características especiais" },
                        "015": { desc: "Bibliografias segundo o lugar" },
                        "016": { desc: "Bibliografias de assuntos específicos. Bibliografias especializadas" },
                        "017": { desc: "Catálogos em geral. Catálogos de assunto" },
                        "018": { desc: "Catálogos onomásticos" },
                        "019": { desc: "Catálogos-dicionários" }
                    }
                },
                "02": {
                    desc: "Biblioteconomia",
                    children: {
                        "021": { desc: "Função, valor, utilidade, criação, desenvolvimento de bibliotecas" },
                        "022": { desc: "Localização da biblioteca, edifícios. Equipamento" },
                        "023": { desc: "Administração da biblioteca. Pessoal" },
                        "024": { desc: "Relações da biblioteca com o público. Regulamentos sobre o uso da biblioteca" },
                        "025": { desc: "Departamentos administrativos das bibliotecas" },
                        "026": { desc: "Bibliotecas especializadas" },
                        "027": {
                            desc: "Bibliotecas gerais",
                            children: {
                                "027.6": { desc: "Bibliotecas destinadas a determinadas categorias de leitores" },
                                "027.7": { desc: "Bibliotecas de estabelecimentos de ensino superior" },
                                "027.8": { desc: "Bibliotecas de estabelecimentos de ensino primário e secundário" }
                            }
                        }
                    }
                },
                "030": { desc: "Obras gerais de referência (como assunto)" },
                "050": { desc: "Publicações periódicas, periódicos (como assunto)" },
                "06": {
                    desc: "Organizações em geral",
                    children: {
                        "06.01": { desc: "Direitos e deveres dos membros" },
                        "06.05": { desc: "Recompensas. Distinções. Prémios" },
                        "061": {
                            desc: "Organizações e outros tipos de cooperação",
                            children: {
                                "061.1": { desc: "Organizações e cooperação governamentais" },
                                "061.2": {
                                    desc: "Organizações e cooperação não governamentais",
                                    children: {
                                        "061.23": { desc: "Organizações com fins humanitários, filantrópicos" },
                                        "061.25": { desc: "Organizações e movimentos secretos e semi-secretos" },
                                        "061.27": { desc: "Fundações. Dotações. Institutos" }
                                    }
                                }
                            }
                        },
                        "069": { desc: "Museus. Exposições permanentes" }
                    }
                },
                "070": { desc: "Jornais. Imprensa" },
                "08": {
                    desc: "Poligrafias. Obras de autoria colectiva",
                    children: {
                        "082": { desc: "Poligrafias colectivas" },
                        "084": { desc: "Material pictórico" },
                        "086": { desc: "Documentos de forma particular" },
                        "087": { desc: "Documentos de origem ou destino particular" }
                    }
                },
                "09": {
                    desc: "Manuscritos. Obras raras e notáveis",
                    children: {
                        "091": { desc: "Manuscritos" },
                        "092": { desc: "Livros xilográficos" },
                        "093": { desc: "Incunábulos" },
                        "094": { desc: "Outras obras impressas notáveis e raras" },
                        "095": { desc: "Obras notáveis pela encadernação" },
                        "096": { desc: "Obras notáveis pelas ilustrações ou pelos materiais utilizados" },
                        "097": { desc: "Marcas de propriedade ou de origem" }
                    }
                }
            }
        },
        "1": {
            desc: "Filosofia. Psicologia",
            children: {
                "101": { desc: "Natureza e âmbito da filosofia" },
                "11": { desc: "Metafísica", children: { "111": { desc: "Metafísica geral. Ontologia" } } },
                "13": {
                    desc: "Filosofia da mente e do espírito. Metafísica da vida espiritual",
                    children: {
                        "130.1": { desc: "Conceitos e leis gerais" },
                        "130.2": { desc: "Filosofia da cultura. Sistemas culturais" },
                        "130.3": { desc: "Metafísica da vida espiritual" },
                        "133": { desc: "Paranormal. O oculto. Fenómenos psi" }
                    }
                },
                "14": {
                    desc: "Sistemas e pontos de vista filosóficos",
                    children: {
                        "140": { desc: "Atitudes filosóficas possíveis. Tipologia de sistemas filosóficos" },
                        "141": { desc: "Tipos de pontos de vista filosóficos" }
                    }
                },
                "159.9": {
                    desc: "Psicologia",
                    children: {
                        "159.91": { desc: "Psicofisiologia (psicologia fisiológica). Fisiologia mental" },
                        "159.92": { desc: "Desenvolvimento e capacidade mental. Psicologia comparada" },
                        "159.93": { desc: "Sensação. Percepção sensorial" },
                        "159.94": {
                            desc: "Funções executivas",
                            children: {
                                "159.942": { desc: "Emoções. Afectos. Sensibilidade. Sentimentos" },
                                "159.943": { desc: "Conação e movimento" },
                                "159.944": { desc: "Trabalho e fadiga. Eficiência" },
                                "159.946": { desc: "Funções motoras especiais" },
                                "159.947": { desc: "Volição. Vontade" }
                            }
                        },
                        "159.95": { desc: "Processos mentais superiores" },
                        "159.96": { desc: "Estados e processos mentais especiais" },
                        "159.97": { desc: "Psicopatologia" },
                        "159.98": { desc: "Psicologia aplicada (psicotecnologia) em geral" }
                    }
                },
                "16": {
                    desc: "Lógica. Epistemologia. Teoria do conhecimento",
                    children: {
                        "161": { desc: "Fundamentos da lógica" },
                        "164": { desc: "Logística. Lógica simbólica. Lógica matemática" },
                        "165": { desc: "Teoria do conhecimento. Epistemologia" }
                    }
                },
                "17": {
                    desc: "Filosofia moral. Ética. Filosofia prática",
                    children: {
                        "171": { desc: "Ética individual. Deveres do indivíduo para consigo mesmo" },
                        "172": { desc: "Ética social. Deveres para com os outros" },
                        "173": { desc: "Ética familiar" },
                        "176": { desc: "Ética sexual. Moralidade sexual" },
                        "177": { desc: "Ética e sociedade" }
                    }
                }
            }
        },
        "2": {
            desc: "Religião. Teologia",
            children: {
                "2-1": {
                    desc: "Teoria e filosofia da religião. Natureza da religião",
                    children: {
                        "2-13": { desc: "O divino. O Sagrado. O Sobrenatural" },
                        "2-14": { desc: "Deus. Deuses" },
                        "2-15": { desc: "Natureza de Deus(es)" },
                        "2-17": { desc: "Universo. Natureza do Universo. Cosmologia" },
                        "2-18": { desc: "Homem. Humanidade. Condição humana", children: { "2-184": { desc: "Relação do Homem com Deus(es)" } } }
                    }
                },
                "2-2": {
                    desc: "Provas da religião",
                    children: {
                        "2-23": { desc: "Livros sagrados. Escrituras. Textos religiosos" },
                        "2-25": { desc: "Literatura secundária. Obras pseudocanónicas" },
                        "2-27": { desc: "Obras críticas" },
                        "2-28": { desc: "Outros textos religiosos" }
                    }
                },
                "2-3": {
                    desc: "Pessoas na religião",
                    children: {
                        "2-31": { desc: "Criador, fundador, figura central da fé" },
                        "2-32": { desc: "Messias" },
                        "2-34": { desc: "Mártires" },
                        "2-35": { desc: "Ascetas. Eremitas. Faquires" },
                        "2-36": { desc: "Santos. Bodhisattvas. Pessoas iluminadas" },
                        "2-37": { desc: "Mahatmas. Gurus. Sábios" },
                        "2-38": { desc: "Carismáticos. Pessoas com poderes sobrenaturais" }
                    }
                },
                "2-4": {
                    desc: "Actividades religiosas. Práticas religiosas",
                    children: {
                        "2-42": { desc: "Comportamento moral. Teologia moral" },
                        "2-43": { desc: "Costumes e prática social. Teologia social" },
                        "2-46": { desc: "Caridade. Apoio aos outros. Actividades pastorais" },
                        "2-47": { desc: "Educação religiosa", children: { "2-475": { desc: "Pregação. Homiliética" } } }
                    }
                },
                "2-5": {
                    desc: "Veneração. Culto. Rituais e cerimónias",
                    children: {
                        "2-523": { desc: "Edifícios para uso religioso. Eclesiologia" },
                        "2-526": { desc: "Objectos do culto. Mobiliário e decoração" },
                        "2-53": { desc: "Actos de veneração/adoração" },
                        "2-54": { desc: "Cerimónias segundo o objectivo" },
                        "2-55": { desc: "Sacramentos" },
                        "2-56": { desc: "Celebração" }
                    }
                },
                "2-6": {
                    desc: "Processos em religião",
                    children: {
                        "2-65": { desc: "Comparação de religiões" },
                        "2-67": { desc: "Relações entre confissões religiosas" }
                    }
                },
                "2-7": {
                    desc: "Organização e administração religiosa",
                    children: {
                        "2-72": { desc: "Natureza e estructura da religião organizada" },
                        "2-73": { desc: "Governo da religião" },
                        "2-74": { desc: "Administração legal. Lei religiosa. Direito canónico" },
                        "2-76": { desc: "Recrutamento. Actividade missionária" },
                        "2-77": { desc: "Estrutura organizacional da fé, da religião" },
                        "2-78": { desc: "Organizações religiosas. Sociedades e associações religiosas" }
                    }
                },
                "2-84": { desc: "Religiões associadas ao Estado" },
                "2-87": { desc: "Cismas. Heresias" },
                "2-9": { desc: "História da fé, religião, denominação ou igreja" },
                "21": {
                    desc: "Religiões pré-históricas e primitivas",
                    children: {
                        "212": { desc: "Religiões pré-históricas" },
                        "213": { desc: "Religiões primitivas" }
                    }
                },
                "22": {
                    desc: "Religiões originárias do Extremo Oriente",
                    children: {
                        "221": { desc: "Religiões da China", children: { "221.3": { desc: "Taoismo" } } },
                        "223": { desc: "Religiões da Coreia" },
                        "225": { desc: "Religiões do Japão" }
                    }
                },
                "23": {
                    desc: "Religiões originárias do sub-continente indiano. Hinduísmo",
                    children: {
                        "233": { desc: "Hinduismo em sentido restrito" },
                        "234": { desc: "Jainismo" },
                        "235": { desc: "Sikhismo" }
                    }
                },
                "24": {
                    desc: "Budismo",
                    children: {
                        "241": { desc: "Budismo hinayana. O Pequeno Veículo" },
                        "242": { desc: "Budismo mahayana. O Grande Veículo" },
                        "243": { desc: "Lamaísmo" },
                        "244": { desc: "Budismo japonês" }
                    }
                },
                "25": {
                    desc: "Religiões da antiguidade. Cultos e religiões menores",
                    children: {
                        "251": { desc: "Religião do Egipto antigo" },
                        "252": { desc: "Religiões da Mesopotâmia" },
                        "254": { desc: "Religiões do Irão" },
                        "255": { desc: "Religiões da antiguidade clássica" },
                        "257": { desc: "Religiões da Europa" },
                        "258": { desc: "Religiões da América Central e do Sul" }
                    }
                },
                "26": {
                    desc: "Judaísmo",
                    children: {
                        "261": { desc: "Religião do período Bíblico. Judaísmo antigo" },
                        "262": { desc: "Judaísmo asquenazita" },
                        "264": { desc: "Judaísmo sefardita" },
                        "265": { desc: "Judaísmo ortodoxo" },
                        "266": { desc: "Judaísmo progressista" },
                        "267": { desc: "Movimentos modernos originários do Judaísmo" }
                    }
                },
                "27": {
                    desc: "Cristianismo. Igrejas e denominações cristãs",
                    children: {
                        "271": { desc: "Igrejas do Oriente" },
                        "272": { desc: "Igreja Católica Romana" },
                        "273": { desc: "Igrejas episcopais católicas não filiadas a Roma" },
                        "274": { desc: "Protestantismo em sentido lato" },
                        "275": { desc: "Igrejas reformadas" },
                        "276": { desc: "Anabaptistas" },
                        "277": { desc: "Igrejas livres. Não conformistas" },
                        "278": { desc: "Outras igrejas protestantes" },
                        "279": { desc: "Outros movimentos e igrejas cristãs" }
                    }
                },
                "28": {
                    desc: "Islamismo",
                    children: {
                        "281": { desc: "Sufismo" },
                        "282": { desc: "Sunni. Islamismo sunita" },
                        "284": { desc: "Shi'a. Islamismo xiita" },
                        "285": { desc: "Babismo" },
                        "286": { desc: "Bahaísmo" }
                    }
                },
                "29": { desc: "Movimentos espirituais modernos" }
            }
        },
        "3": {
            desc: "Ciências Sociais",
            children: {
                "303": { desc: "Métodos das ciências sociais" },
                "304": { desc: "Questões sociais. Prática social" },
                "305": { desc: "Estudos do género" },
                "308": { desc: "Sociografia" },
                "311": {
                    desc: "Estatística como ciência. Teoria estatística",
                    children: {
                        "311.1": { desc: "Fundamentos, bases da estatística" },
                        "311.2": { desc: "Técnica de pesquisa. Preparação. Tabulação" },
                        "311.3": { desc: "Organização geral das estatísticas. Estatísticas oficiais" },
                        "311.4": { desc: "Estatísticas privadas" }
                    }
                },
                "314": { desc: "Demografia. Estudos da população", children: { "314.1": { desc: "População" } } },
                "316": {
                    desc: "Sociologia",
                    children: {
                        "316.1": { desc: "Objecto e âmbito da sociologia" },
                        "316.2": { desc: "Pontos de vista e tendências sociológicas" },
                        "316.3": {
                            desc: "Estrutura social. Sociedade como sistema social",
                            children: {
                                "316.33": { desc: "Elementos básicos e subsistemas das sociedades globais" },
                                "316.34": { desc: "Estratificação social. Diferenciação social" },
                                "316.35": { desc: "Grupos sociais. Organizações sociais" },
                                "316.36": { desc: "Casamento e familía" }
                            }
                        },
                        "316.4": { desc: "Processos sociais. Dinâmicas sociais" },
                        "316.6": { desc: "Psicologia social" },
                        "316.7": { desc: "Sociologia da cultura. Contexto cultural da vida social" }
                    }
                },
                "32": {
                    desc: "Política",
                    children: {
                        "321": { desc: "Formas de organização política. Estados como poderes políticos" },
                        "322": { desc: "Relações entre o estado e a igreja" },
                        "323": {
                            desc: "Assuntos internos. Política interna",
                            children: {
                                "323.1": { desc: "Movimentos e problemas nacionalistas, populares e étnicos" },
                                "323.2": { desc: "Relações entre a população e o Estado" },
                                "323.4": { desc: "Luta de classes" }
                            }
                        },
                        "324": { desc: "Eleições. Plebiscitos. Referendos" },
                        "325": { desc: "Abertura de territórios. Colonização. Colonialismo" },
                        "326": { desc: "Escravatura" },
                        "327": {
                            desc: "Relações internacionais. Política mundial",
                            children: {
                                "327.2": { desc: "Imperialismo. Política imperialista" },
                                "327.3": { desc: "Internacionalismo" },
                                "327.5": { desc: "Blocos internacionais" },
                                "327.7": { desc: "Actividade das organizações internacionais e intergovernamentais" },
                                "327.8": { desc: "Influência política, pressão sobre outros Estados" }
                            }
                        },
                        "328": { desc: "Parlamentos. Congressos. Governos" },
                        "329": { desc: "Partidos e movimentos políticos" }
                    }
                },
                "33": {
                    desc: "Economia. Ciência económica",
                    children: {
                        "330": {
                            desc: "Economia em geral",
                            children: {
                                "330.1": { desc: "Ciência económica. Teoria, conceitos económicos básicos" },
                                "330.3": { desc: "Dinâmica da economia. Movimento económico" },
                                "330.4": { desc: "Economia matemática" },
                                "330.5": { desc: "Propriedade nacional. Contabilidade nacional" },
                                "330.8": { desc: "História das teorias, doutrinas, dogmas económicos" }
                            }
                        },
                        "331": {
                            desc: "Trabalho. Emprego. Economia do trabalho",
                            children: {
                                "331.1": { desc: "Teoria e organização do trabalho" },
                                "331.2": { desc: "Salários. Ordenados. Remuneração" },
                                "331.3": { desc: "Outras condições de trabalho, além do salário" },
                                "331.4": { desc: "Ambiente de trabalho. Segurança e higiene do trabalho" },
                                "331.5": { desc: "Mercado de trabalho. Emprego" }
                            }
                        },
                        "332": {
                            desc: "Economia regional. Economia territorial",
                            children: {
                                "332.1": { desc: "Economia regional. Economia territorial" },
                                "332.2": { desc: "Economia da terra" },
                                "332.3": { desc: "Utilização da terra" },
                                "332.5": { desc: "Procura da terra" },
                                "332.6": { desc: "Valor da terra. Valor da propriedade imóvel" },
                                "332.7": { desc: "Comércio de terra, de bens imóveis" },
                                "332.8": { desc: "Economia da habitação" }
                            }
                        },
                        "334": { desc: "Formas de organização e cooperação na economia" },
                        "336": {
                            desc: "Finanças",
                            children: {
                                "336.1": { desc: "Finanças públicas. Finanças do governo em geral" },
                                "336.2": { desc: "Receitas públicas" },
                                "336.5": { desc: "Despesa pública. Despesa do estado" },
                                "336.7": { desc: "Moeda. Sistema monetário. Banca. Bolsa de valores" }
                            }
                        },
                        "338": {
                            desc: "Situação económica. Política económica. Produção",
                            children: {
                                "338.1": { desc: "Situação económica. Ciclo económico" },
                                "338.2": { desc: "Política económica. Gestão da economia" },
                                "338.3": { desc: "Produção" },
                                "338.4": { desc: "Produção e serviços segundo os sectores económicos", children: { "338.48": { desc: "Turismo" } } },
                                "338.5": { desc: "Preços. Formação de preços. Custos" }
                            }
                        },
                        "339": {
                            desc: "Comércio. Relações económicas internacionais",
                            children: {
                                "339.1": { desc: "Questões gerais sobre as trocas e o comércio" },
                                "339.3": { desc: "Comércio interno. Comércio nacional" },
                                "339.5": { desc: "Comércio externo. Comércio internacional" },
                                "339.7": { desc: "Finanças internacionais" },
                                "339.9": { desc: "Economia internacional. Economia global" }
                            }
                        }
                    }
                },
                "34": {
                    desc: "Direito. Jurisprudência",
                    children: {
                        "340": {
                            desc: "Lei em geral. Métodos jurídicos",
                            children: {
                                "340.1": { desc: "Tipos e formas do direito", children: { "340.13": { desc: "Direito positivo. Norma legal" }, "340.14": { desc: "Leis não escritas. Leis não estatutárias" } } },
                                "340.5": { desc: "Direito comparado" },
                                "340.6": { desc: "Ciências auxiliares do direito. Medicina legal" }
                            }
                        },
                        "341": {
                            desc: "Direito internacional. Direito das nações",
                            children: {
                                "341.1": { desc: "Direito das organizações internacionais" },
                                "341.2": { desc: "Sujeitos e objectos do direito internacional" },
                                "341.3": { desc: "Direito de guerra" },
                                "341.4": { desc: "Direito penal internacional" },
                                "341.6": { desc: "Arbitragem internacional. Adjudicação e jurisdição internacionais" },
                                "341.7": { desc: "Direito diplomático" },
                                "341.8": { desc: "Direito consular" },
                                "341.9": { desc: "Direito internacional privado. Conflitos de leis" }
                            }
                        },
                        "342": {
                            desc: "Direito público. Direito constitucional",
                            children: {
                                "342.1": { desc: "Estado. Povo. Nação. Poder do Estado" },
                                "342.2": { desc: "Estado. Estrutura dos estados" },
                                "342.3": { desc: "Autoridade suprema. Soberania. Formas de Estado" },
                                "342.4": { desc: "Constituições. Assembleias legislativas" },
                                "342.5": { desc: "Poderes do Estado" },
                                "342.6": { desc: "Poder executivo do Estado" },
                                "342.7": { desc: "Direitos e liberdades fundamentais. Direitos humanos" },
                                "342.8": { desc: "Lei eleitoral. Votação. Sistemas eleitorais" },
                                "342.9": { desc: "Direito administrativo" }
                            }
                        },
                        "343": {
                            desc: "Direito penal. Delitos penais",
                            children: {
                                "343.1": { desc: "Justiça penal. Investigação penal. Processo penal" },
                                "343.2": { desc: "Direito penal propriamente dito" },
                                "343.3": { desc: "Crimes contra o Estado" },
                                "343.4": { desc: "Atentados contra as liberdades fundamentais" },
                                "343.5": { desc: "Infracções contra a confiança pública, a moral, a família" },
                                "343.6": { desc: "Infracções contra pessoas" },
                                "343.8": { desc: "Pena. Execução de sentença" },
                                "343.9": { desc: "Criminologia. Ciências criminais" }
                            }
                        },
                        "344": { desc: "Direito penal especial. Direito penal militar" },
                        "346": {
                            desc: "Direito económico",
                            children: {
                                "346.2": { desc: "Sujeitos do direito económico" },
                                "346.3": { desc: "Responsabilidades económicas. Contratos económicos" },
                                "346.5": { desc: "Regulação da ordem económica e seu controlo" },
                                "346.6": { desc: "Regulação de preços, tarifas, finanças, créditos e contas" },
                                "346.7": { desc: "Regulação dos sectores individuais da economia" },
                                "346.9": { desc: "Aplicação do direito económico" }
                            }
                        },
                        "347": {
                            desc: "Direito civil",
                            children: {
                                "347.1": { desc: "Direito civil em geral" },
                                "347.2": { desc: "Direitos reais" },
                                "347.3": { desc: "Bens móveis em geral. Bens mobiliários" },
                                "347.4": { desc: "Obrigações. Responsabilidade contratual. Contratos" },
                                "347.5": { desc: "Responsabilidades não contratuais. Danos" },
                                "347.6": { desc: "Direito da família. Direito das sucessões" },
                                "347.7": { desc: "Direito comercial. Direito das sociedades" },
                                "347.8": { desc: "Direito do ar, do espaço, do éter" },
                                "347.9": { desc: "Direito processual. Organização e pessoal judiciário" }
                            }
                        },
                        "348": { desc: "Direito eclesiástico. Direito canónico" },
                        "349": { desc: "Ramos especiais do direito" }
                    }
                },
                "35": {
                    desc: "Administração pública. Governo. Assuntos militares",
                    children: {
                        "351": { desc: "Actividades específicas da administração pública" },
                        "352": { desc: "Níveis mais baixos da administração pública. Governo local" },
                        "353": {
                            desc: "Níveis médios da administração. Governo regional",
                            children: {
                                "353.1": { desc: "Divisões primárias do país. Regiões" },
                                "353.2": { desc: "Governos provinciais. Províncias" },
                                "353.5": { desc: "Divisões das províncias. Distritos" },
                                "353.8": { desc: "Tipos especiais da administração regional" },
                                "353.9": { desc: "Administração independente das regiões de um país" }
                            }
                        },
                        "354": { desc: "Nível mais alto da administração. Governo central", children: { "354.1": { desc: "Ministérios para assuntos gerais" } } },
                        "355": {
                            desc: "Assuntos militares em geral",
                            children: {
                                "355.1": { desc: "Forças armadas em geral. Vida militar" },
                                "355.2": { desc: "Recrutamento de forças. Recrutamento" },
                                "355.3": { desc: "Organização geral das forças armadas" },
                                "355.4": { desc: "Operações de guerra em geral. Táctica. Estratégia" },
                                "355.5": { desc: "Serviços e tácticas de forças e unidades específicas" },
                                "355.6": { desc: "Administração militar" },
                                "355.7": { desc: "Estabelecimentos militares. Organização. Funções" }
                            }
                        },
                        "356": { desc: "Serviços do exército em geral. Infantaria" },
                        "357": { desc: "Cavalaria. Tropas montadas. Tropas motorizadas" },
                        "358": {
                            desc: "Artilharia. Engenharia. Aviação",
                            children: {
                                "358.1": { desc: "Artilharia" },
                                "358.4": { desc: "Aviação militar. Força aérea" }
                            }
                        },
                        "359": { desc: "Forças navais. Marinha" }
                    }
                },
                "36": {
                    desc: "Protecção das necessidades materiais e mentais da vida. Serviço social",
                    children: {
                        "364": {
                            desc: "Bem-estar social",
                            children: {
                                "364-1": { desc: "Teorias sobre o bem-estar social" },
                                "364-2": { desc: "Princípios da assistência" },
                                "364-3": { desc: "Agências de bem-estar social" },
                                "364-4": { desc: "Pessoas como provedoras de assistência ao bem-estar social" },
                                "364-5": { desc: "Instalações do bem-estar social" },
                                "364-6": { desc: "Contribuições e pagamentos" },
                                "364-7": { desc: "Processos do bem-estar social. Serviços sociais" },
                                "364.2": { desc: "Necessidades humanas básicas" },
                                "364.3": { desc: "Benefícios sociais. Segurança social" },
                                "364.4": { desc: "Áreas de actuação do serviço social" },
                                "364.6": { desc: "Questões do bem-estar social" }
                            }
                        },
                        "365": { desc: "Desejo de habitação e sua satisfação" },
                        "366": { desc: "Consumerismo" },
                        "368": { desc: "Seguros" }
                    }
                },
                "37": {
                    desc: "Educação",
                    children: {
                        "37.01": { desc: "Fundamentos da educação. Teoria" },
                        "37.02": { desc: "Questões gerais de didáctica e método" },
                        "37.04": { desc: "Educação em relação ao educando" },
                        "37.06": { desc: "Problemas sociais na educação" },
                        "37.07": { desc: "Aspectos relacionados com a gestão de instituições de ensino" },
                        "37.09": { desc: "Organização da instrução" },
                        "373": { desc: "Tipos de escolas que ministram ensino em geral" },
                        "374": { desc: "Ensino e formação extra-escolares" },
                        "376": { desc: "Educação, ensino e treino de grupos especiais" },
                        "377": { desc: "Ensino especializado. Formação técnica e profissional" },
                        "378": { desc: "Ensino superior. Universidades" },
                        "379.8": { desc: "Lazer" }
                    }
                },
                "39": {
                    desc: "Antropologia cultural. Etnologia. Etnografia",
                    children: {
                        "391": { desc: "Vestuário. Indumentária. Moda" },
                        "392": { desc: "Usos e costumes na vida privada" },
                        "393": { desc: "Morte. Tratamento de cadáveres. Funerais" },
                        "394": { desc: "Vida pública. Vida social" },
                        "395": { desc: "Cerimonial social. Etiqueta" },
                        "398": { desc: "Folclore em sentido restrito" }
                    }
                }
            }
        },
        "5": {
            desc: "Matemática. Ciências Naturais",
            children: {
                "502": { desc: "O meio ambiente e a sua protecção" },
                "504": { desc: "Ameaças ao ambiente" },
                "51": {
                    desc: "Matemática",
                    children: {
                        "510": {
                            desc: "Considerações fundamentais e gerais das matemáticas",
                            children: {
                                "510.2": { desc: "Problemas gerais da lógica matemática" },
                                "510.3": { desc: "Teoria dos conjuntos" },
                                "510.6": { desc: "Lógica matemática" }
                            }
                        },
                        "511": { desc: "Teoria dos números" },
                        "512": { desc: "Álgebra" },
                        "514": { desc: "Geometria", children: { "514.7": { desc: "Geometria diferencial" } } },
                        "515.1": { desc: "Topologia" },
                        "517": { desc: "Análise matemática", children: { "517.9": { desc: "Equações diferenciais. Equações integrais" } } },
                        "519.1": { desc: "Análise combinatória. Teoria dos grafos" },
                        "519.2": { desc: "Probabilidade. Estatística matemática" },
                        "519.6": { desc: "Matemática computacional. Análise numérica" },
                        "519.7": { desc: "Cibernética matemática" },
                        "519.8": {
                            desc: "Teorias e métodos de investigação operacional matemática",
                            children: {
                                "519.83": { desc: "Teoria dos jogos" },
                                "519.85": { desc: "Programação matemática" }
                            }
                        }
                    }
                },
                "52": {
                    desc: "Astronomia. Astrofísica. Geodésia",
                    children: {
                        "520": { desc: "Instrumentos e técnicas astronómicas" },
                        "521": { desc: "Astronomia teórica. Mecânica celeste", children: { "521.9": { desc: "Astrometria. Astronomia esférica" } } },
                        "523": {
                            desc: "O sistema solar",
                            children: {
                                "523.3": { desc: "Sistema Terra-Lua" },
                                "523.4": { desc: "Planetas e seus satélites. Planetologia" },
                                "523.6": { desc: "Meio interplanetário. Cometas. Meteoros" },
                                "523.9": { desc: "O Sol. Física solar" }
                            }
                        },
                        "524": {
                            desc: "Estrelas. Sistemas estelares. O Universo",
                            children: {
                                "524.1": { desc: "Raios cósmicos" },
                                "524.3": { desc: "Estrelas" },
                                "524.4": { desc: "Aglomerados de estrelas. Associações de estrelas" },
                                "524.5": { desc: "Meio interestelar. Nebulosas galácticas" },
                                "524.6": { desc: "A Galáxia (Via Láctea)" },
                                "524.7": { desc: "Sistemas extragalácticos" },
                                "524.8": { desc: "O Universo. Metagaláxia. Cosmologia" }
                            }
                        },
                        "528": {
                            desc: "Geodésia. Levantamento. Fotogrametria. Cartografia",
                            children: {
                                "528.1": { desc: "Teoria dos erros e da correcção na geodésia" },
                                "528.2": { desc: "Forma da Terra. Medição da Terra" },
                                "528.3": { desc: "Levantamento geodésico" },
                                "528.4": { desc: "Levantamentos de campo. Topografia" },
                                "528.5": { desc: "Instrumentos e equipamentos geodésicos" },
                                "528.7": { desc: "Fotogrametria: aérea, terrestre" },
                                "528.8": { desc: "Captação remota de dados" },
                                "528.9": { desc: "Cartografia" }
                            }
                        }
                    }
                },
                "53": {
                    desc: "Física",
                    children: {
                        "53.01": { desc: "Teoria e natureza dos fenómenos" },
                        "53.02": { desc: "Leis gerais dos fenómenos" },
                        "53.03": { desc: "Produção e causas dos fenómenos" },
                        "53.04": { desc: "Efeitos dos fenómenos" },
                        "53.05": { desc: "Observação e registo dos fenómenos" },
                        "53.06": { desc: "Aplicação, utilização dos fenómenos" },
                        "53.07": { desc: "Aparelhos para produção e estudo dos fenómenos" },
                        "53.08": { desc: "Princípios gerais e teoria da medição" },
                        "53.09": { desc: "Dependência de fenómenos relativos a determinados efeitos" },
                        "531": {
                            desc: "Mecânica em geral. Mecânica dos corpos sólidos",
                            children: {
                                "531.1": { desc: "Cinemática" },
                                "531.2": { desc: "Estática. Forças. Equilíbrio" },
                                "531.3": { desc: "Dinâmica. Cinética" },
                                "531.4": { desc: "Trabalho. Peso. Massa. Fricção" },
                                "531.5": { desc: "Gravidade. Gravitação. Pêndulos. Balística" },
                                "531.6": { desc: "Energia mecânica" },
                                "531.7": { desc: "Medição de quantidades geométricas e mecânicas" },
                                "531.8": { desc: "Teoria das máquinas. Mecânica técnica" }
                            }
                        },
                        "532": {
                            desc: "Mecânica dos fluídos em geral. Hidromecânica",
                            children: {
                                "532.1": { desc: "Hidrostática em geral" },
                                "532.2": { desc: "Equilíbrio dos líquidos" },
                                "532.3": { desc: "Corpos imersos. Corpos flutuantes" },
                                "532.5": { desc: "Movimentos dos líquidos. Hidrodinâmica" },
                                "532.6": { desc: "Fenómenos de superfície. Tensão superficial" },
                                "532.7": { desc: "Teoria cinética dos líquidos. Osmose" }
                            }
                        },
                        "533": {
                            desc: "Mecânica dos gases. Aeromecânica. Física do plasma",
                            children: {
                                "533.1": { desc: "Propriedades dos gases" },
                                "533.2": { desc: "Elasticidade. Compressibilidade. Liquefacção" },
                                "533.5": { desc: "Gases rarefeitos. Física do vácuo" },
                                "533.6": { desc: "Aerodinâmica" },
                                "533.7": { desc: "Teoria cinética dos gases" },
                                "533.9": { desc: "Física do plasma" }
                            }
                        },
                        "534": {
                            desc: "Vibrações. Ondas. Acústica",
                            children: {
                                "534.1": { desc: "Vibração de corpos" },
                                "534.2": { desc: "Propagação das vibrações" },
                                "534.3": { desc: "Sons e percepção musical" },
                                "534.4": { desc: "Análise e síntese de sons" },
                                "534.5": { desc: "Composição das vibrações" },
                                "534.6": { desc: "Medições acústicas" },
                                "534.7": { desc: "Acústica fisiológica. Acústica médica" },
                                "534.8": { desc: "Aplicações da acústica" }
                            }
                        },
                        "535": {
                            desc: "Óptica",
                            children: {
                                "535.1": { desc: "Teoria da luz" },
                                "535.2": { desc: "Propagação e energética da radiação. Fotometria" },
                                "535.3": { desc: "Propagação. Reflexão. Refracção" },
                                "535.4": { desc: "Interferência. Difracção" },
                                "535.5": { desc: "Polarização. Dupla Refracção" },
                                "535.6": { desc: "Cores e suas propriedades. Teoria da cor" },
                                "535.8": { desc: "Aplicações da óptica em geral" }
                            }
                        },
                        "536": {
                            desc: "Calor. Termodinâmica",
                            children: {
                                "536.1": { desc: "Teoria geral do calor" },
                                "536.2": { desc: "Condução de calor. Transferência de calor" },
                                "536.3": { desc: "Efeito dos corpos sobre a radiação térmica" },
                                "536.4": { desc: "Efeito da entrada de calor e da temperatura" },
                                "536.5": { desc: "Temperatura. Medição de temperatura" },
                                "536.6": { desc: "Calorimetria" },
                                "536.7": { desc: "Termodinâmica. Energética" }
                            }
                        },
                        "537": {
                            desc: "Electricidade. Magnetismo. Electromagnetismo",
                            children: {
                                "537.2": { desc: "Electricidade estática. Electroestática" },
                                "537.3": { desc: "Electricidade de corrente. Corrente eléctrica" },
                                "537.5": { desc: "Fenómenos do electrão e do ião" },
                                "537.6": { desc: "Magnetismo" },
                                "537.8": { desc: "Electromagnetismo. Electrodinâmica" }
                            }
                        },
                        "538.9": { desc: "Física da matéria condensada. Física do estado sólido" },
                        "539": {
                            desc: "Natureza física da matéria",
                            children: {
                                "539.1": { desc: "Física nuclear. Física atómica. Física molecular" },
                                "539.2": { desc: "Propriedades e estruturas dos sistemas moleculares" },
                                "539.3": { desc: "Elasticidade. Deformação. Mecânica de sólidos elásticos" },
                                "539.4": { desc: "Força. Resistência à tensão" },
                                "539.5": { desc: "Propriedades dos materiais que afectam a deformabilidade" },
                                "539.6": { desc: "Forças intermoleculares" },
                                "539.8": { desc: "Outros efeitos físico-mecânicos" }
                            }
                        }
                    }
                },
                "54": {
                    desc: "Química. Cristalografia. Mineralogia",
                    children: {
                        "542": {
                            desc: "Química prática de laboratório",
                            children: {
                                "542.1": { desc: "Laboratórios químicos" },
                                "542.2": { desc: "Aparelhos e técnicas de laboratório em geral" },
                                "542.3": { desc: "Medição de peso, massa, volume" },
                                "542.4": { desc: "Aplicação de calor e frio" },
                                "542.5": { desc: "Uso de chamas" },
                                "542.6": { desc: "Trabalho com líquidos" },
                                "542.7": { desc: "Trabalhos com gases" },
                                "542.8": { desc: "Operações físicas, físico-químicas e eléctricas" },
                                "542.9": { desc: "Reacções químicas" }
                            }
                        },
                        "543": {
                            desc: "Química analítica",
                            children: {
                                "543.2": { desc: "Métodos químicos de análise" },
                                "543.3": { desc: "Amostragem e análise da água" },
                                "543.4": { desc: "Métodos de análise espectral" },
                                "543.5": { desc: "Métodos físico-químicos de análise" },
                                "543.6": { desc: "Análise de diferentes substâncias" },
                                "543.9": { desc: "Análise por reacções biológicas e bioquímicas" }
                            }
                        },
                        "544": {
                            desc: "Química física",
                            children: {
                                "544.1": { desc: "Estrutura química da matéria" },
                                "544.2": { desc: "Química física dos sólidos, dos líquidos e dos gases" },
                                "544.3": { desc: "Termodinâmica química" },
                                "544.4": { desc: "Cinética química. Catálise" },
                                "544.5": { desc: "Química dos processos de alta energia" },
                                "544.6": { desc: "Electroquímica" },
                                "544.7": { desc: "Química dos fenómenos de superfície e colóides" }
                            }
                        },
                        "546": {
                            desc: "Química inorgânica",
                            children: {
                                "546.1": { desc: "Não metais e metalóides em geral" },
                                "546.3": { desc: "Metais em geral" }
                            }
                        },
                        "547": {
                            desc: "Química orgânica",
                            children: {
                                "547.1": { desc: "Classificação dos compostos orgânicos" }
                            }
                        },
                        "548": {
                            desc: "Cristalografia",
                            children: {
                                "548.1": { desc: "Cristalografia matemática" },
                                "548.2": { desc: "Crescimento do cristal" },
                                "548.3": { desc: "Química dos cristais" },
                                "548.4": { desc: "Irregularidades nos cristais" },
                                "548.5": { desc: "Formação, crescimento e dissolução dos cristais" },
                                "548.7": { desc: "Estrutura fina dos cristais" }
                            }
                        },
                        "549": {
                            desc: "Mineralogia",
                            children: {
                                "549.2": { desc: "Elementos e ligas naturais" },
                                "549.3": { desc: "Sulfetos. Sulfossais" },
                                "549.4": { desc: "Haletos. Halóides" },
                                "549.5": { desc: "Compostos de oxigénio" },
                                "549.6": { desc: "Silicatos. Titanatos. Zirconatos" },
                                "549.7": { desc: "Outros compostos de oxiácidos" },
                                "549.8": { desc: "Minerais orgânicos" }
                            }
                        }
                    }
                },
                "55": {
                    desc: "Ciências da terra. Geologia",
                    children: {
                        "550": {
                            desc: "Ciências auxiliares da geologia",
                            children: {
                                "550.1": { desc: "Fisiografia" },
                                "550.2": { desc: "Geoastronomia. Cosmogonia" },
                                "550.3": { desc: "Geofísica" },
                                "550.4": { desc: "Geoquímica" },
                                "550.7": { desc: "Geobiologia" },
                                "550.8": { desc: "Geologia e geofísica aplicada. Prospecção" },
                                "550.93": { desc: "Geocronologia. Datação geológica" }
                            }
                        },
                        "551": {
                            desc: "Geologia geral. Meteorologia. Climatologia",
                            children: {
                                "551.1": { desc: "Estrutura geral da Terra" },
                                "551.2": {
                                    desc: "Geodinâmica interna (processos endógenos)",
                                    children: {
                                        "551.21": { desc: "Vulcanicidade. Vulcanismo" },
                                        "551.24": { desc: "Geotectónica" }
                                    }
                                },
                                "551.3": {
                                    desc: "Geodinâmica externa (processos exógenos)",
                                    children: {
                                        "551.32": { desc: "Glaciologia" }
                                    }
                                },
                                "551.4": {
                                    desc: "Geomorfologia",
                                    children: {
                                        "551.44": { desc: "Espeleologia. Cavernas" },
                                        "551.46": { desc: "Oceanografia física" }
                                    }
                                },
                                "551.58": { desc: "Climatologia" },
                                "551.7": { desc: "Geologia histórica. Estratigrafia" },
                                "551.8": { desc: "Paleogeografia" }
                            }
                        },
                        "552": {
                            desc: "Petrologia. Petrografia",
                            children: {
                                "552.1": { desc: "Características e propriedades em geral das rochas" },
                                "552.3": { desc: "Rochas magmáticas. Rochas ígneas" },
                                "552.4": { desc: "Rochas metamórficas" },
                                "552.5": { desc: "Rochas sedimentares" },
                                "552.6": { desc: "Meteoritos" }
                            }
                        },
                        "553": {
                            desc: "Geologia económica. Depósitos minerais",
                            children: {
                                "553.2": { desc: "Formação do minério" },
                                "553.3": { desc: "Depósitos de minério em geral" },
                                "553.4": { desc: "Outros depósitos de minérios" },
                                "553.5": { desc: "Depósitos de pedra natural" },
                                "553.6": { desc: "Depósitos de vários minerais e terras inorgânicas" },
                                "553.7": { desc: "Fontes minerais" },
                                "553.8": { desc: "Depósitos de pedras preciosas e semipreciosas" },
                                "553.9": { desc: "Depósitos de rochas carbonáceas" }
                            }
                        },
                        "556": {
                            desc: "Hidrosfera. Hidrologia",
                            children: {
                                "556.3": { desc: "Hidrologia das águas subterrâneas. Hidrogeologia" },
                                "556.5": { desc: "Hidrologia da água de superfície" }
                            }
                        }
                    }
                },
                "56": { desc: "Paleontologia" },
                "57": {
                    desc: "Ciências biológicas em geral",
                    children: {
                        "57.01": { desc: "Leis gerais. Aspectos teóricos" },
                        "57.02": { desc: "Processos biológicos e etológicos" },
                        "57.03": { desc: "Padrão das variações de propriedade" },
                        "57.04": { desc: "Factores. Influências" },
                        "57.05": { desc: "Características dependentes do controlo central" },
                        "57.06": { desc: "Nomenclatura e classificação de organismos" },
                        "57.07": { desc: "Paleontologia analítica" },
                        "57.08": { desc: "Técnicas biológicas. Métodos experimentais" },
                        "572": {
                            desc: "Antropologia física",
                            children: {
                                "572.1": { desc: "Antropogenia. Origem da espécie humana" },
                                "572.9": { desc: "Antropogeografia especial" }
                            }
                        },
                        "573": { desc: "Biologia geral e teórica" },
                        "574": { desc: "Ecologia geral e biodiversidade" },
                        "575": { desc: "Genética geral" },
                        "576": { desc: "Biologia celular e subcelular. Citologia" },
                        "577": { desc: "Bases materiais da vida. Bioquímica. Biofísica" },
                        "578": { desc: "Virologia" },
                        "579": {
                            desc: "Microbiologia",
                            children: {
                                "579.2": { desc: "Microbiologia geral" },
                                "579.6": { desc: "Microbiologia aplicada" },
                                "579.8": { desc: "Microrganismos. Bactéria" }
                            }
                        }
                    }
                },
                "58": {
                    desc: "Botânica",
                    children: {
                        "581": {
                            desc: "Botânica geral",
                            children: {
                                "581.1": { desc: "Fisiologia vegetal" },
                                "581.2": { desc: "Doenças das plantas. Fitopatologia" },
                                "581.3": { desc: "Embriologia vegetal" },
                                "581.4": { desc: "Morfologia vegetal. Anatomia vegetal" },
                                "581.5": { desc: "Hábitos das plantas. Ecologia vegetal" },
                                "581.6": { desc: "Botânica aplicada. Uso de plantas" },
                                "581.8": { desc: "Histologia vegetal" },
                                "581.9": { desc: "Botânica geográfica" }
                            }
                        },
                        "582": {
                            desc: "Botânica sistemática",
                            children: {
                                "582.091": { desc: "Árvores" },
                                "582.093": { desc: "Arbustos" },
                                "582.095": { desc: "Crescimento subterrâneo" },
                                "582.097": { desc: "Plantas trepadoras lenhosas" },
                                "582.099": { desc: "Plantas herbáceas ou não-lenhosas" },
                                "582.23": { desc: "Bacteria" },
                                "582.24": { desc: "Protista. Chromista" },
                                "582.261": { desc: "Algae (algas)" },
                                "582.28": { desc: "Fungos" },
                                "582.29": { desc: "Líquenes" },
                                "582.32": { desc: "Bryophyta (briófitas)" },
                                "582.361": { desc: "Tracheophyta (plantas vasculares)" },
                                "582.37": { desc: "Pteridophyta (pteridófitos). Fetos" },
                                "582.4": {
                                    desc: "Spermatophyta (plantas com semente)",
                                    children: {
                                        "582.42": { desc: "Gymnosperms (gimnospermas)" },
                                        "582.44": { desc: "Cycadophyta (cicadófita)" },
                                        "582.46": { desc: "Ginkgophyta" },
                                        "582.47": { desc: "Pinophyta / Coniferae (coníferas)" }
                                    }
                                },
                                "582.5": {
                                    desc: "Magnoliophyta (angiospermes)",
                                    children: {
                                        "582.51": { desc: "Arecales (palmeira). Pandanales" },
                                        "582.53": { desc: "Alismatales" },
                                        "582.54": { desc: "Poales" },
                                        "582.56": { desc: "Zingiberales" },
                                        "582.57": { desc: "Liliales" },
                                        "582.58": { desc: "Asparagales" }
                                    }
                                },
                                "582.6": {
                                    desc: "Dicotyledoneae (dicotiledóneas)",
                                    children: {
                                        "582.62": { desc: "Fagales" },
                                        "582.63": { desc: "Rosales" },
                                        "582.65": { desc: "Nymphaeales" },
                                        "582.66": { desc: "Caryophyllales" },
                                        "582.67": { desc: "Magnoliids" },
                                        "582.68": { desc: "Dilleniidae" }
                                    }
                                },
                                "582.7": { desc: "Rosidae" },
                                "582.82": { desc: "Vitales" },
                                "582.9": { desc: "Asteridae" }
                            }
                        }
                    }
                },
                "59": {
                    desc: "Zoologia",
                    children: {
                        "591": {
                            desc: "Zoologia geral",
                            children: {
                                "591.1": { desc: "Fisiologia animal" },
                                "591.2": { desc: "Doenças de animais" },
                                "591.3": { desc: "Embriologia animal" },
                                "591.4": { desc: "Anatomia animal" },
                                "591.5": { desc: "Hábitos animais. Ecologia. Etologia" },
                                "591.6": { desc: "Zoologia económica. Zoologia aplicada" },
                                "591.8": { desc: "Histologia animal" },
                                "591.9": { desc: "Zoologia geográfica. Fauna" }
                            }
                        },
                        "592": { desc: "Invertebrata. Invertebrados em geral" },
                        "593.1": { desc: "Protozoários" },
                        "593.4": { desc: "Poríferos (esponjas)" },
                        "594": { desc: "Moluscos. Briozoários. Braquiópodes" },
                        "595": {
                            desc: "Articulata",
                            children: {
                                "595.7": { desc: "Insecta. Insectos. Entomologia" }
                            }
                        },
                        "596": {
                            desc: "Chordata. Cordados",
                            children: {
                                "596.2": { desc: "Urocordados (tunicados)" }
                            }
                        },
                        "597": {
                            desc: "Vertebrata. Vertebrados. Pisces. Peixes",
                            children: {
                                "597.3": { desc: "Peixes cartilaginosos" },
                                "597.4": { desc: "Osteichthyes (peixes ósseos)" },
                                "597.6": { desc: "Amphibia. Anfíbios" }
                            }
                        },
                        "598": {
                            desc: "Sauropsídeos",
                            children: {
                                "598.1": { desc: "Reptilia. Répteis" },
                                "598.2": { desc: "Aves. Ornitologia" }
                            }
                        },
                        "599": {
                            desc: "Mammalia (mamíferos)",
                            children: {
                                "599.1": { desc: "Prototheria" },
                                "599.2": { desc: "Metatheria. Marsupiais" },
                                "599.3": {
                                    desc: "Eutheria (mamíferos placentários)",
                                    children: {
                                        "599.31": { desc: "Pholidota" },
                                        "599.32": { desc: "Rodentia (roedores)" },
                                        "599.35": { desc: "Insectivora (insectívoros)" }
                                    }
                                },
                                "599.4": { desc: "Chiroptera (morcegos)" },
                                "599.5": { desc: "Cetáceos" },
                                "599.61": { desc: "Proboscidea (elefantes)" },
                                "599.72": { desc: "Perissodactyla (ungulados de dedos ímpares)" },
                                "599.73": { desc: "Artiodactyla (ungulados de dedos pares)" },
                                "599.74": { desc: "Carnivora (carnívoros)" },
                                "599.8": { desc: "Primates (primatas)" }
                            }
                        }
                    }
                }
            }
        },
        "6": {
            desc: "Ciências aplicadas. Medicina. Tecnologia",
            children: {
                "60": {
                    desc: "Biotecnologia",
                    children: {
                        "601": { desc: "Conceitos fundamentais" },
                        "602": { desc: "Processos e técnicas em biotecnologia" },
                        "604": { desc: "Produtos biotecnológicos" },
                        "606": { desc: "Aplicações da biotecnologia" },
                        "608": { desc: "Problemas em biotecnologia" }
                    }
                },
                "61": {
                    desc: "Ciências médicas",
                    children: {
                        "611": { desc: "Anatomia. Anatomia humana" },
                        "612": {
                            desc: "Fisiologia. Fisiologia humana",
                            children: {
                                "612.1": { desc: "Sangue. Sistema cardiovascular" },
                                "612.2": { desc: "Respiração. Sistema respiratório" },
                                "612.3": { desc: "Alimentação. Digestão" },
                                "612.4": { desc: "Sistema glandular" },
                                "612.5": { desc: "Calor animal" },
                                "612.6": { desc: "Reprodução. Crescimento" },
                                "612.7": { desc: "Funções motoras" },
                                "612.8": { desc: "Sistema nervoso. Órgãos sensoriais" }
                            }
                        },
                        "613": {
                            desc: "Higiene em geral. Saúde pessoal",
                            children: {
                                "613.2": { desc: "Dietética" },
                                "613.4": { desc: "Higiene pessoal" },
                                "613.6": { desc: "Saúde ocupacional" },
                                "613.7": { desc: "Saúde e higiene dos tempos livres" },
                                "613.8": { desc: "Saúde e higiene do sistema nervoso" }
                            }
                        },
                        "614": {
                            desc: "Saúde e higiene públicas",
                            children: {
                                "614.2": { desc: "Organização pública e profissional da saúde" },
                                "614.4": { desc: "Controlo e prevenção de doenças transmissíveis" },
                                "614.7": { desc: "Higiene do ar, água, solo. Poluição" },
                                "614.8": { desc: "Acidentes. Segurança" },
                                "614.9": { desc: "Saúde dos animais" }
                            }
                        },
                        "615": {
                            desc: "Farmacologia. Terapêutica. Toxicologia",
                            children: {
                                "615.1": { desc: "Farmácia geral e profissional" },
                                "615.8": { desc: "Fisioterapia. Radioterapia" }
                            }
                        },
                        "616": {
                            desc: "Patologia. Medicina clínica",
                            children: {
                                "616-001": { desc: "Traumatismos. Feridas" },
                                "616-002": { desc: "Inflamação" },
                                "616-006": { desc: "Tumores. Oncologia" },
                                "616-007": { desc: "Malformações" },
                                "616-009": { desc: "Distúrbios nervosos" },
                                "616-05": { desc: "Pessoas e características pessoais em patologia" },
                                "616-07": { desc: "Semiologia. Diagnóstico" },
                                "616-08": { desc: "Tratamento" },
                                "616.1": { desc: "Patologia do sistema circulatório" },
                                "616.2": { desc: "Patologia do sistema respiratório" },
                                "616.3": {
                                    desc: "Patologia do sistema digestivo",
                                    children: {
                                        "616.31": { desc: "Estomatologia. Doenças da boca e dos dentes" }
                                    }
                                },
                                "616.5": { desc: "Dermatologia clínica. Doenças cutâneas" },
                                "616.6": { desc: "Patologias do sistema urogenital" },
                                "616.7": { desc: "Patologia dos órgãos da locomoção" },
                                "616.8": { desc: "Neurologia. Psiquiatria" },
                                "616.9": { desc: "Doenças transmissíveis. Doenças infecciosas" }
                            }
                        },
                        "617": { desc: "Cirurgia. Ortopedia. Oftalmologia" },
                        "618": { desc: "Ginecologia. Obstetrícia" }
                    }
                },
                "62": {
                    desc: "Engenharia. Tecnologia em geral",
                    children: {
                        "620": {
                            desc: "Testes dos materiais. Economia de energia",
                            children: {
                                "620.3": { desc: "Nanotecnologia" }
                            }
                        },
                        "621": {
                            desc: "Engenharia mecânica em geral. Engenharia eléctrica",
                            children: {
                                "621.1": { desc: "Máquinas térmicas. Máquinas a vapor" },
                                "621.22": { desc: "Energia hidráulica" },
                                "621.3": { desc: "Engenharia eléctrica" },
                                "621.4": { desc: "Motores térmicos" },
                                "621.5": { desc: "Energia pneumática. Refrigeração" },
                                "621.6": { desc: "Manipulação e distribuição de fluidos" },
                                "621.7": { desc: "Tecnologia mecânica em geral" },
                                "621.8": { desc: "Elementos das máquinas" },
                                "621.9": { desc: "Trabalho à máquina" }
                            }
                        },
                        "622": {
                            desc: "Mineração",
                            children: {
                                "622.1": { desc: "Estudo e levantamento da mina" },
                                "622.2": { desc: "Operações de mineração" },
                                "622.3": { desc: "Mineração de minerais específicos" },
                                "622.7": { desc: "Processamento de minerais" }
                            }
                        },
                        "623": {
                            desc: "Engenharia militar",
                            children: {
                                "623.1": { desc: "Fortificações" },
                                "623.4": { desc: "Armamentos. Material militar" },
                                "623.7": { desc: "Aviação militar e naval" },
                                "623.8": { desc: "Engenharia naval. Construção naval" }
                            }
                        },
                        "624": {
                            desc: "Engenharia civil e de estruturas em geral",
                            children: {
                                "624.01": { desc: "Estruturas segundo o material" },
                                "624.1": { desc: "Terraplanagem. Fundações. Túneis" },
                                "624.21": { desc: "Construção de pontes" }
                            }
                        },
                        "625": {
                            desc: "Engenharia do transporte terrestre",
                            children: {
                                "625.1": { desc: "Ferrovias em geral" },
                                "625.7": { desc: "Rodovias em geral. Estradas" }
                            }
                        },
                        "626": { desc: "Engenharia hidráulica em geral" },
                        "627": {
                            desc: "Engenharia de cursos de água naturais. Portos",
                            children: {
                                "627.8": { desc: "Represas. Centrais hidroeléctricas" }
                            }
                        },
                        "628": {
                            desc: "Engenharia de saúde pública. Saneamento",
                            children: {
                                "628.1": { desc: "Abastecimento de água" },
                                "628.2": { desc: "Drenagem urbana. Esgotos" },
                                "628.4": { desc: "Higiene urbana. Resíduos. Lixo" },
                                "628.9": { desc: "Iluminação" }
                            }
                        },
                        "629": {
                            desc: "Engenharia de veículos de transporte",
                            children: {
                                "629.3": { desc: "Engenharia de veículos terrestres" },
                                "629.4": { desc: "Engenharia de veículos ferroviários" },
                                "629.5": { desc: "Engenharia naval. Construção de navios" },
                                "629.7": { desc: "Engenharia de transportes aéreo e espacial. Aeronáutica" }
                            }
                        }
                    }
                },
                "63": {
                    desc: "Agricultura. Ciências agrárias",
                    children: {
                        "630": { desc: "Silvicultura. Florestas" },
                        "631": {
                            desc: "Agricultura em geral. Agronomia",
                            children: {
                                "631.1": { desc: "Gestão de propriedades agrícolas" },
                                "631.3": { desc: "Máquinas e equipamento agrícola" },
                                "631.4": { desc: "Ciências do solo. Pedologia" },
                                "631.8": { desc: "Fertilizantes" }
                            }
                        },
                        "632": { desc: "Doenças das plantas. Pragas" },
                        "633": {
                            desc: "Culturas e sua produção",
                            children: {
                                "633.1": { desc: "Cereais" }
                            }
                        },
                        "634": {
                            desc: "Fruticultura",
                            children: {
                                "634.8": { desc: "Viticultura" }
                            }
                        },
                        "635": { desc: "Horticultura. Jardinagem" },
                        "636": {
                            desc: "Criação de animais. Pecuária",
                            children: {
                                "636.09": { desc: "Medicina veterinária" }
                            }
                        },
                        "637": { desc: "Produtos de animais domésticos" },
                        "639": { desc: "Caça. Pesca. Piscicultura" }
                    }
                },
                "64": {
                    desc: "Economia doméstica",
                    children: {
                        "641": { desc: "Alimentos. Culinária" },
                        "643": { desc: "A casa. A residência" },
                        "646": { desc: "Roupa. Cuidado com o corpo" }
                    }
                },
                "65": {
                    desc: "Indústrias da comunicação e dos transportes. Contabilidade",
                    children: {
                        "654": { desc: "Telecomunicação" },
                        "655": { desc: "Indústrias gráficas. Edição" },
                        "656": { desc: "Serviços de transporte. Tráfego" },
                        "657": { desc: "Contabilidade" },
                        "658": {
                            desc: "Gestão, administração de empresas",
                            children: {
                                "658.3": { desc: "Recursos humanos" },
                                "658.8": { desc: "Marketing. Vendas" }
                            }
                        },
                        "659": { desc: "Publicidade. Relações públicas" }
                    }
                },
                "66": {
                    desc: "Tecnologia química",
                    children: {
                        "661": { desc: "Químicos" },
                        "662": { desc: "Explosivos. Combustíveis" },
                        "663": {
                            desc: "Microbiologia industrial. Bebidas",
                            children: {
                                "663.2": { desc: "Vinhos. Enologia" }
                            }
                        },
                        "664": { desc: "Produção de alimentos" },
                        "665": { desc: "Óleos. Gorduras. Ceras. Petróleo" },
                        "666": { desc: "Indústria do vidro. Cerâmica. Cimento" },
                        "667": { desc: "Indústrias de corantes. Tintas" },
                        "669": { desc: "Metalurgia. Siderurgia" }
                    }
                },
                "67": {
                    desc: "Indústria, artes industriais e ofícios diversos",
                    children: {
                        "671": { desc: "Metais preciosos. Joalharia" },
                        "672": { desc: "Artigos de ferro e aço" },
                        "674": { desc: "Indústria da madeira" },
                        "675": { desc: "Indústria do couro" },
                        "676": { desc: "Indústria do papel" },
                        "677": { desc: "Indústria têxtil" },
                        "678": { desc: "Borracha. Plásticos" }
                    }
                },
                "68": {
                    desc: "Indústrias de artigos acabados ou montados",
                    children: {
                        "681": {
                            desc: "Mecanismos e instrumentos de precisão",
                            children: {
                                "681.5": { desc: "Engenharia de controle automático" },
                                "681.6": { desc: "Máquinas de reprodução gráfica" }
                            }
                        },
                        "687": { desc: "Indústria do vestuário" }
                    }
                },
                "69": {
                    desc: "Indústria da construção",
                    children: {
                        "691": { desc: "Materiais de construção" }
                    }
                }
            }
        },
        "7": {
            desc: "Arte. Recreação. Desporto",
            children: {
                "7.01": { desc: "Teoria e filosofia da arte" },
                "7.03": { desc: "Períodos e fases artísticas. Estilos" },
                "71": {
                    desc: "Planeamento territorial. Urbanismo",
                    children: {
                        "711": { desc: "Planeamento regional, urbano e rural" },
                        "712": { desc: "Planeamento da paisagem. Parques. Jardins" }
                    }
                },
                "72": {
                    desc: "Arquitectura",
                    children: {
                        "721": { desc: "Edifícios em geral" },
                        "725": { desc: "Edifícios públicos, comerciais e industriais" },
                        "726": { desc: "Arquitectura religiosa" },
                        "728": { desc: "Arquitectura da habitação" }
                    }
                },
                "73": {
                    desc: "Artes plásticas. Escultura",
                    children: {
                        "737": { desc: "Numismática" },
                        "738": { desc: "Cerâmica artística" },
                        "739": { desc: "Arte do metal. Ourivesaria" }
                    }
                },
                "74": {
                    desc: "Desenho. Design. Artes aplicadas",
                    children: {
                        "741": { desc: "Desenho em geral" },
                        "744": { desc: "Desenho técnico" },
                        "745": { desc: "Artes decorativas, artesanato" }
                    }
                },
                "75": { desc: "Pintura" },
                "76": { desc: "Artes gráficas. Gravura" },
                "77": { desc: "Fotografia" },
                "78": {
                    desc: "Música",
                    children: {
                        "78.01": { desc: "Teoria e filosofia da música" },
                        "782": { desc: "Música dramática. Ópera" },
                        "784": { desc: "Música vocal" },
                        "785": { desc: "Música instrumental" }
                    }
                },
                "79": {
                    desc: "Divertimentos. Espectáculos. Jogos. Desportos",
                    children: {
                        "791": { desc: "Cinema. Filmes" },
                        "792": { desc: "Teatro" },
                        "793": { desc: "Divertimentos sociais. Dança" },
                        "794": { desc: "Jogos de mesa. Xadrez" },
                        "796": {
                            desc: "Desporto. Jogos. Exercícios físicos",
                            children: {
                                "796.3": { desc: "Jogos de bola" },
                                "796.4": { desc: "Ginástica. Atletismo" }
                            }
                        },
                        "797": { desc: "Desportos aquáticos e aéreos" },
                        "798": { desc: "Equitação e hipismo" },
                        "799": { desc: "Pesca desportiva. Caça desportiva" }
                    }
                }
            }
        },
        "8": {
            desc: "Língua. Linguística. Literatura",
            children: {
                "80": {
                    desc: "Filologia. Questões gerais",
                    children: {
                        "801": { desc: "Prosódia" },
                        "808": { desc: "Retórica" }
                    }
                },
                "81": {
                    desc: "Linguística e línguas",
                    children: {
                        "811": {
                            desc: "Línguas individuais",
                            children: {
                                "811.111": { desc: "Inglês" },
                                "811.112.2": { desc: "Alemão" },
                                "811.133.1": { desc: "Francês" },
                                "811.134.2": { desc: "Espanhol" },
                                "811.134.3": { desc: "Português" }
                            }
                        }
                    }
                },
                "82": {
                    desc: "Literatura",
                    children: {
                        "82-1": { desc: "Poesia" },
                        "82-2": { desc: "Drama. Peças de teatro" },
                        "82-3": { desc: "Ficção. Romance" },
                        "821": {
                            desc: "Literaturas de línguas individuais",
                            children: {
                                "821.134.3": { desc: "Literatura portuguesa" }
                            }
                        }
                    }
                }
            }
        },
        "9": {
            desc: "Geografia. Biografia. História",
            children: {
                "902": { desc: "Arqueologia" },
                "903": { desc: "Pré-história" },
                "908": { desc: "Estudos regionais" },
                "91": {
                    desc: "Geografia. Exploração",
                    children: {
                        "911": { desc: "Geografia geral" },
                        "912": { desc: "Mapas. Atlas" },
                        "913": { desc: "Geografia regional" }
                    }
                },
                "92": {
                    desc: "Estudos biográficos. Genealogia",
                    children: {
                        "929": { desc: "Biografias", children: { "929.5": { desc: "Genealogia" }, "929.6": { desc: "Heráldica" }, "929.9": { desc: "Bandeiras" } } }
                    }
                },
                "93": {
                    desc: "História (ciência histórica)",
                    children: {
                        "930": { desc: "Ciência histórica. Arquivística" }
                    }
                },
                "94": { desc: "História em geral" }
            }
        }
    }
};
