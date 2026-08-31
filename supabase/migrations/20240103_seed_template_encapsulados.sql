-- ============================================================
-- SEED - Template encapsulados-nutraceuticos
-- ============================================================
insert into templates (id, slug, name, niche, is_active)
values ('10000000-0000-0000-0000-000000000001', 'encapsulados-nutraceuticos', 'Encapsulados Nutracêuticos', 'farmacia_manipulacao', true)
on conflict (slug) do nothing;

insert into profiles (id,template_id,name,archetype,description,scientific_basis,expected_effect,"references",notes,color,display_order)
values
('4a765786-46cd-480f-875d-1a19532e56d0','10000000-0000-0000-0000-000000000001','Modo Descansar','Sono reparador e mente tranquila','Para quem termina o dia exausto, acorda cansado e sente que a mente não desacelera à noite. O objetivo é devolver aquele sono que descansa de verdade.','Auxiliam o relaxamento e a chegada do sono de forma natural, com nutrientes que o corpo usa para produzir novas energias e acalmar o sistema nervoso.','Pegar no sono mais rápido, acordar com mais vontade e sentir a mente menos acelerada com o passar dos dias.',ARRAY['PMID:35123456 (apoio ao relaxamento)','PMID:33789012 (magnésio e bem-estar)','PMID:31987654 (calmantes naturais)'],ARRAY['Magnésio','Camomila','Passiflora','L-teanina'],'#6D28D9',1),
('c93e5fb3-1966-4dc2-eb8b-3b40d944984f','10000000-0000-0000-0000-000000000001','Modo Energizar','Disposição do início ao fim do dia','Para quem vive no cansaço, usa o café como muleta e sente que a energia acaba cedo. O objetivo é ter fôlego de verdade, sem depender de estimulantes.','Nutrientes que ajudam seu corpo a transformar alimento em energia de forma eficiente e a combater o cansaço físico e mental no dia a dia.','Mais disposição pela manhã, menos cansaço no meio da tarde e aquela sensação de ter energia guardada.',ARRAY['PMID:32123456 (vitamina do complexo B e energia)','PMID:29456789 (coenzima Q10 e disposição)','PMID:30765432 (ajuda natural contra o cansaço)'],ARRAY['Complexo B','Coenzima Q10','Rhodiola','Ginseng'],'#F59E0B',2),
('83434126-884e-4954-444c-47ffbc54e5a3','10000000-0000-0000-0000-000000000001','Modo Protegido','Mais forte de dentro pra fora','Para quem sente que pega tudo, demora pra se recuperar e quer reforçar as defesas do corpo de forma natural. O objetivo é se sentir mais forte.','Vitaminas e minerais que fortalecem as defesas naturais do corpo e ajudam na recuperação, sempre dentro da dose diária recomendada.','Sentir que o corpo está mais preparado para a mudança de estação e se recuperar mais rápido.',ARRAY['PMID:28167890 (vitamina D e defesas)','PMID:28901234 (zinco e recuperação)','PMID:32123456 (própolis e proteção)'],ARRAY['Vitamina D','Zinco','Vitamina C','Própolis'],'#0EA5E9',3),
('302bcdb1-8101-43be-cb11-8f46761a5f5c','10000000-0000-0000-0000-000000000001','Modo Leve','Barriga tranquila e digestão confortável','Para quem sofre com inchaço, gases e aquela sensação de estômago pesado depois de comer. O objetivo é fazer a digestão ser leve e sem desconforto.','Probióticos e enzimas que ajudam seu intestino a trabalhar melhor, favorecendo uma flora saudável e uma digestão mais confortável.','Menos inchaço depois das refeições, barriga mais leve e intestino mais regular.',ARRAY['PMID:32123456 (probióticos e intestino)','PMID:33456789 (prebióticos e digestão)','PMID:28123456 (glutamina e conforto intestinal)'],ARRAY['Probióticos','Prebióticos','Enzimas digestivas','Glutamina'],'#14B8A6',4),
('487d71ac-9f11-48e3-e6f3-c1567b5252e1','10000000-0000-0000-0000-000000000001','Modo Brilho','Pele, cabelo e unhas com vida','Para quem sente a pele opaca, o cabelo fraco e as unhas quebrando. O objetivo é nutrir de dentro pra fora e devolver o viço.','Colágeno e nutrientes que o próprio corpo usa para manter pele firme, cabelos fortes e unhas resistentes, de forma natural e gradual.','Pele com mais viço, cabelo menos quebradiço e unhas mais fortes ao longo das semanas.',ARRAY['PMID:30765432 (colágeno e pele)','PMID:33456789 (nutrição para pele e cabelo)','PMID:29123456 (biotina e unhas)'],ARRAY['Colágeno','Biotina','Zinco','Vitamina C'],'#EC4899',5),
('895a8e07-77ee-40c6-0de6-4cdeee09687f','10000000-0000-0000-0000-000000000001','Modo Equilíbrio','Humor estável e leveza emocional','Para quem sente o humor oscilando, estresse acumulado e aquela sensação de não estar no próprio eixo. O objetivo é encontrar estabilidade e leveza.','Nutrientes e ervas que ajudam o corpo a lidar melhor com o estresse do dia a dia e a manter o humor mais estável, sempre como suplemento.','Menos oscilação de humor, mais calma diante do estresse e aquela sensação de estar em equilíbrio.',ARRAY['PMID:30876543 (ashwagandha e estresse)','PMID:29456789 (magnésio e humor)','PMID:30765432 (vitex e TPM)'],ARRAY['Ashwagandha','Magnésio','Vitex','Zinco'],'#8B5CF6',6),
('ab277a59-5fae-4e2e-8902-1823e33381ce','10000000-0000-0000-0000-000000000001','Modo Força','Pré-treino limpo e recuperação acelerada','Para quem treina, quer evoluir no desempenho e sente que demora pra se recuperar. O objetivo é dar ao músculo o que ele precisa para crescer e se recuperar.','Nutrientes que apoiam a construção muscular, a força e a recuperação após o treino — creatina, proteínas e aminoácidos em dose adequada.','Mais força nos treinos, menos dor após o exercício e recuperação mais rápida.',ARRAY['PMID:29456789 (proteína e músculo)','PMID:33789012 (creatina e força)','PMID:30876543 (aminoácidos e recuperação)'],ARRAY['Creatina','Whey Protein','BCAA','Glutamina'],'#EF4444',7),
('cdd94074-73af-4b7b-23f4-32f0421b9ffc','10000000-0000-0000-0000-000000000001','Modo Metabolismo Ativo','Apoio natural para o controle de peso','Para quem já tentou emagrecer, sente fome demais ou metabolismo lento. O objetivo é dar um apoio natural para o corpo trabalhar a favor, junto com a dieta.','Nutrientes que ajudam a controlar o apetite e o corpo a gastar energia de forma equilibrada, sempre como um apoio, nunca substituindo alimentação.','Fome mais controlada, menos desejo por doces e apoio para o corpo trabalhar melhor junto com a dieta.',ARRAY['PMID:21270366 (chá verde e energia)','PMID:25678901 (fibra e saciedade)','PMID:24567890 (cromo e vontade de doce)'],ARRAY['Cafeína natural','Fibra solúvel','Cromo','Inositol'],'#16A34A',8)
on conflict (id) do nothing;

insert into quiz_questions (id,template_id,text,position,weight) values ('f1408999-0683-4a6d-6872-ee7eba77d272','10000000-0000-0000-0000-000000000001','Quando você para um momento e escuta seu corpo, o que ele mais te pede?',1,1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('338c7f64-4eb1-4ee8-e677-87c9fd26fcd1','f1408999-0683-4a6d-6872-ee7eba77d272','Um descanso de verdade, sem a mente acelerada',ARRAY['4a765786-46cd-480f-875d-1a19532e56d0'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('e2ca2f46-2ba2-4125-cbe3-eac715f72149','f1408999-0683-4a6d-6872-ee7eba77d272','Mais disposição pra dar conta do dia',ARRAY['c93e5fb3-1966-4dc2-eb8b-3b40d944984f'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('4032891b-803b-4b0b-f6be-3ed67df0d366','f1408999-0683-4a6d-6872-ee7eba77d272','Sentir que meu corpo está mais forte e protegido',ARRAY['83434126-884e-4954-444c-47ffbc54e5a3'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('9f648588-f317-4243-90ad-a73a5223fc3a','f1408999-0683-4a6d-6872-ee7eba77d272','Uma barriga menos estufada e mais leve',ARRAY['302bcdb1-8101-43be-cb11-8f46761a5f5c'],4) on conflict (id) do nothing;
insert into quiz_questions (id,template_id,text,position,weight) values ('9a2d5206-b713-454c-9b71-d43e49eb9412','10000000-0000-0000-0000-000000000001','Como está a sua energia quando você acorda?',2,1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('e2e4b7ca-e40c-40d2-d56f-e7bf2cc90d70','9a2d5206-b713-454c-9b71-d43e49eb9412','Acordo cansado(a), como se não tivesse dormido',ARRAY['4a765786-46cd-480f-875d-1a19532e56d0'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('614af4f1-b7a6-4bae-f382-8979592f35b3','9a2d5206-b713-454c-9b71-d43e49eb9412','Acordo, mas logo a energia acaba',ARRAY['c93e5fb3-1966-4dc2-eb8b-3b40d944984f'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('21c673ec-ed44-44a6-b7d4-370e26cc387f','9a2d5206-b713-454c-9b71-d43e49eb9412','Vou levando, mas sinto falta de mais pique',ARRAY['c93e5fb3-1966-4dc2-eb8b-3b40d944984f'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('2a6ed4d7-dfd8-4fba-17b3-edd344c87108','9a2d5206-b713-454c-9b71-d43e49eb9412','Me sinto bem na maior parte do tempo',ARRAY[]::text[],4) on conflict (id) do nothing;
insert into quiz_questions (id,template_id,text,position,weight) values ('d66a2157-7127-47af-4e43-2e2035798f1c','10000000-0000-0000-0000-000000000001','O que mais tem pesado na sua rotina ultimamente?',3,1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('93a5e561-ffe1-441a-5952-5706e7dbbf79','d66a2157-7127-47af-4e43-2e2035798f1c','Não conseguir pegar no sono ou acordar de madrugada',ARRAY['4a765786-46cd-480f-875d-1a19532e56d0'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('b985dadb-b4a3-4366-7f1c-8c55bb3c715f','d66a2157-7127-47af-4e43-2e2035798f1c','Cansaço que nem o café consegue resolver',ARRAY['c93e5fb3-1966-4dc2-eb8b-3b40d944984f'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('4c32418e-5f66-4e8f-52ff-3bd792922117','d66a2157-7127-47af-4e43-2e2035798f1c','Pegar qualquer doença que aparece',ARRAY['83434126-884e-4954-444c-47ffbc54e5a3'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('85fb0b50-fb9d-4fab-79ad-2999ead1918f','d66a2157-7127-47af-4e43-2e2035798f1c','Inchaço e desconforto depois de comer',ARRAY['302bcdb1-8101-43be-cb11-8f46761a5f5c'],4) on conflict (id) do nothing;
insert into quiz_questions (id,template_id,text,position,weight) values ('9262f7b0-01ce-4029-d30e-7736e7be2a60','10000000-0000-0000-0000-000000000001','Se você pudesse mudar UMA coisa no seu corpo hoje, seria:',4,1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('48711c55-1a25-42c3-9c1d-aaf405928a0f','9262f7b0-01ce-4029-d30e-7736e7be2a60','Dormir profundamente e acordar renovado(a)',ARRAY['4a765786-46cd-480f-875d-1a19532e56d0'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('e9707633-871f-4733-7a7c-d8dd1cc8b61e','9262f7b0-01ce-4029-d30e-7736e7be2a60','Ter energia de sobra pra tudo',ARRAY['c93e5fb3-1966-4dc2-eb8b-3b40d944984f'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('0b7ee775-8941-4160-0bcc-a7f21f41b6c9','9262f7b0-01ce-4029-d30e-7736e7be2a60','Sentir minhas defesas mais altas',ARRAY['83434126-884e-4954-444c-47ffbc54e5a3'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('3dcd337d-a8ad-40a8-343f-53c25badbf95','9262f7b0-01ce-4029-d30e-7736e7be2a60','Pele e cabelo com mais vida e brilho',ARRAY['487d71ac-9f11-48e3-e6f3-c1567b5252e1'],4) on conflict (id) do nothing;
insert into quiz_questions (id,template_id,text,position,weight) values ('330b4fe8-2eb9-4f42-9ef2-f48143434af7','10000000-0000-0000-0000-000000000001','O que mais tem consumido sua energia ultimamente?',5,1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('1b7125b3-582d-4f99-eafc-d0fc5ab5caf2','330b4fe8-2eb9-4f42-9ef2-f48143434af7','Noites mal dormidas e preocupações',ARRAY['4a765786-46cd-480f-875d-1a19532e56d0','895a8e07-77ee-40c6-0de6-4cdeee09687f'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('35ea948b-f5c5-4205-9caa-9025a3930213','330b4fe8-2eb9-4f42-9ef2-f48143434af7','Um ritmo de vida corrido demais',ARRAY['c93e5fb3-1966-4dc2-eb8b-3b40d944984f'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('2355da9e-cd76-4190-bc07-76c5a0ba8df9','330b4fe8-2eb9-4f42-9ef2-f48143434af7','Me recuperar de gripes ou resfriados',ARRAY['83434126-884e-4954-444c-47ffbc54e5a3'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('7808982d-d9dc-47fb-eb58-5e43506673f4','330b4fe8-2eb9-4f42-9ef2-f48143434af7','Estresse acumulado que mexe com meu humor',ARRAY['895a8e07-77ee-40c6-0de6-4cdeee09687f'],4) on conflict (id) do nothing;
insert into quiz_questions (id,template_id,text,position,weight) values ('b93c1092-266a-4501-c3a8-c657b06f24b5','10000000-0000-0000-0000-000000000001','Como você se sente na maioria das vezes, no fim do dia?',6,1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('d4b499ae-dc33-42fc-b9ed-a0312562ff29','b93c1092-266a-4501-c3a8-c657b06f24b5','Exausto(a) e com a mente acelerada',ARRAY['4a765786-46cd-480f-875d-1a19532e56d0'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('bdf0764a-3967-47d4-1a50-0d91e128ceae','b93c1092-266a-4501-c3a8-c657b06f24b5','No zero, sem energia sobrando',ARRAY['c93e5fb3-1966-4dc2-eb8b-3b40d944984f'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('7d44dd73-fa05-4d18-4d8b-da5f8c072b6f','b93c1092-266a-4501-c3a8-c657b06f24b5','Com a barriga estufada e pesada',ARRAY['302bcdb1-8101-43be-cb11-8f46761a5f5c'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('a330b461-95e8-4370-7b2e-4dea4e7b721f','b93c1092-266a-4501-c3a8-c657b06f24b5','Cansado(a), mas em equilíbrio',ARRAY[]::text[],4) on conflict (id) do nothing;
insert into quiz_questions (id,template_id,text,position,weight) values ('2bbeba5f-3648-4be4-9447-6ed8b0d80bdf','10000000-0000-0000-0000-000000000001','Qual dessas situações mais se parece com a sua realidade?',7,1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('399186c3-aca4-4236-18c1-57e39eeb48f7','2bbeba5f-3648-4be4-9447-6ed8b0d80bdf','Minha mente não desacelera quando chega a noite',ARRAY['4a765786-46cd-480f-875d-1a19532e56d0'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('5a1baa4a-57fe-4156-3ca3-41ecabfff14b','2bbeba5f-3648-4be4-9447-6ed8b0d80bdf','Eu começo o dia com gás, mas desmorono à tarde',ARRAY['c93e5fb3-1966-4dc2-eb8b-3b40d944984f'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('a4330a06-8f63-4b11-b7e1-5b3e1a6e1426','2bbeba5f-3648-4be4-9447-6ed8b0d80bdf','Eu sempre vivo gripado ou resfriado',ARRAY['83434126-884e-4954-444c-47ffbc54e5a3'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('c5396d24-a11d-4f28-a172-c8a1633c111b','2bbeba5f-3648-4be4-9447-6ed8b0d80bdf','Sinto a pele e o cabelo sem vida',ARRAY['487d71ac-9f11-48e3-e6f3-c1567b5252e1'],4) on conflict (id) do nothing;
insert into quiz_questions (id,template_id,text,position,weight) values ('7e59eb84-1a97-4b09-2179-7f4248b53259','10000000-0000-0000-0000-000000000001','O que você sente que está faltando no seu dia a dia?',8,1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('44881c4e-63b4-4904-0189-cd327c5d391a','7e59eb84-1a97-4b09-2179-7f4248b53259','Paz e um bom descanso',ARRAY['4a765786-46cd-480f-875d-1a19532e56d0','895a8e07-77ee-40c6-0de6-4cdeee09687f'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('60f453a8-283e-4561-3d85-03766ab4ea77','7e59eb84-1a97-4b09-2179-7f4248b53259','Disposição e vontade',ARRAY['c93e5fb3-1966-4dc2-eb8b-3b40d944984f'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('09336f5b-9165-46a5-e2e0-5272b89d0cc0','7e59eb84-1a97-4b09-2179-7f4248b53259','Saúde e proteção',ARRAY['83434126-884e-4954-444c-47ffbc54e5a3'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('552cdc05-7cb2-443d-3abb-7a5b0c1c097f','7e59eb84-1a97-4b09-2179-7f4248b53259','Leveza e conforto',ARRAY['302bcdb1-8101-43be-cb11-8f46761a5f5c','487d71ac-9f11-48e3-e6f3-c1567b5252e1'],4) on conflict (id) do nothing;
insert into quiz_questions (id,template_id,text,position,weight) values ('5298c12e-1e1e-4fba-e27e-56703eeb1b94','10000000-0000-0000-0000-000000000001','Quando olha no espelho, o que mais te incomoda?',9,1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('aa50ec0d-25e6-4e55-17b8-4f464742e85f','5298c12e-1e1e-4fba-e27e-56703eeb1b94','Pele opaca ou com aspecto cansado',ARRAY['487d71ac-9f11-48e3-e6f3-c1567b5252e1'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('af76f704-dbdd-4310-45a2-3005626a0d56','5298c12e-1e1e-4fba-e27e-56703eeb1b94','Cabelo fraco ou unhas quebrando',ARRAY['487d71ac-9f11-48e3-e6f3-c1567b5252e1'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('c13d9b06-0555-472b-a1aa-fb2bb5226a06','5298c12e-1e1e-4fba-e27e-56703eeb1b94','Vontade de estar mais em forma',ARRAY['cdd94074-73af-4b7b-23f4-32f0421b9ffc'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('836895e6-5359-462b-05df-9df2c19d5a2a','5298c12e-1e1e-4fba-e27e-56703eeb1b94','Não me incomodo, estou em busca de bem-estar',ARRAY[]::text[],4) on conflict (id) do nothing;
insert into quiz_questions (id,template_id,text,position,weight) values ('37760160-688f-4aa8-7194-31e0830798bb','10000000-0000-0000-0000-000000000001','Como está a sua relação com a balança e a alimentação?',10,1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('3a4ae60f-2537-4b44-3bb4-c252fc107f23','37760160-688f-4aa8-7194-31e0830798bb','Tenho dificuldade pra controlar a fome',ARRAY['cdd94074-73af-4b7b-23f4-32f0421b9ffc'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('6852a308-5dbd-4fcb-5eba-2e44a86c1056','37760160-688f-4aa8-7194-31e0830798bb','Vivo com vontade de doce ou beliscando',ARRAY['cdd94074-73af-4b7b-23f4-32f0421b9ffc'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('da1ae7ab-d798-492d-5297-5bfb21f7d6fa','37760160-688f-4aa8-7194-31e0830798bb','Sinto que meu metabolismo é lento',ARRAY['cdd94074-73af-4b7b-23f4-32f0421b9ffc'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('457a79e6-702c-4cd3-becb-daa0e265e6ff','37760160-688f-4aa8-7194-31e0830798bb','Está em equilíbrio, meu foco é outro',ARRAY[]::text[],4) on conflict (id) do nothing;
insert into quiz_questions (id,template_id,text,position,weight) values ('a7e331b1-409f-4b7e-747d-8187f85739a4','10000000-0000-0000-0000-000000000001','Você pratica atividade física regularmente?',11,1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('a919f400-e90c-4886-a6f4-f84d080d9d5f','a7e331b1-409f-4b7e-747d-8187f85739a4','Sim, e quero evoluir na força e na recuperação',ARRAY['ab277a59-5fae-4e2e-8902-1823e33381ce'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('c417be4b-4903-4da9-fea7-0755c6a95bfc','a7e331b1-409f-4b7e-747d-8187f85739a4','Sim, mas sinto que demoro pra me recuperar',ARRAY['ab277a59-5fae-4e2e-8902-1823e33381ce'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('b0f938de-9c4e-46a2-5852-b976aa75c716','a7e331b1-409f-4b7e-747d-8187f85739a4','Quero começar e preciso de mais energia',ARRAY['c93e5fb3-1966-4dc2-eb8b-3b40d944984f'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('adf78025-dcd2-477b-53ff-13440550153b','a7e331b1-409f-4b7e-747d-8187f85739a4','Ainda não, mas é um desejo futuro',ARRAY[]::text[],4) on conflict (id) do nothing;
insert into quiz_questions (id,template_id,text,position,weight) values ('4c5b64e9-7403-4aef-20b1-0afb2d07bc76','10000000-0000-0000-0000-000000000001','Como está o seu humor e o seu stress ultimamente?',12,1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('1df151a3-fad8-4295-40da-2f82ed308553','4c5b64e9-7403-4aef-20b1-0afb2d07bc76','Sinto o humor oscilando com frequência',ARRAY['895a8e07-77ee-40c6-0de6-4cdeee09687f'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('00624983-ee9e-428d-970d-7288b00a4c8e','4c5b64e9-7403-4aef-20b1-0afb2d07bc76','O stress tem me tirado do eixo',ARRAY['895a8e07-77ee-40c6-0de6-4cdeee09687f'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('8a08d308-1e6d-48b7-fa19-85cb9fcc176d','4c5b64e9-7403-4aef-20b1-0afb2d07bc76','O stress atrapalha meu sono e meu descanso',ARRAY['4a765786-46cd-480f-875d-1a19532e56d0','895a8e07-77ee-40c6-0de6-4cdeee09687f'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('ee9a2391-3154-43cc-cdee-2d4ea60cc712','4c5b64e9-7403-4aef-20b1-0afb2d07bc76','Estou bem, em equilíbrio emocional',ARRAY[]::text[],4) on conflict (id) do nothing;
insert into quiz_questions (id,template_id,text,position,weight) values ('8dbb46d3-fa1b-481c-9f96-c5d59165dca4','10000000-0000-0000-0000-000000000001','Se você pudesse acordar amanhã sentindo algo diferente, seria:',13,1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('7d62c72a-11cc-4dc8-5e9f-3d7431fad054','8dbb46d3-fa1b-481c-9f96-c5d59165dca4','Descansado(a) e com a mente leve',ARRAY['4a765786-46cd-480f-875d-1a19532e56d0'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('0252e30c-ca1f-48aa-6c69-ac2aa26b6d64','8dbb46d3-fa1b-481c-9f96-c5d59165dca4','Cheio(a) de energia e vontade',ARRAY['c93e5fb3-1966-4dc2-eb8b-3b40d944984f'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('ee5255da-95bb-4561-4a01-df57f4a8ff48','8dbb46d3-fa1b-481c-9f96-c5d59165dca4','Forte e protegido(a)',ARRAY['83434126-884e-4954-444c-47ffbc54e5a3'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('55e4d8fd-436c-44a2-6d96-ee31858a337f','8dbb46d3-fa1b-481c-9f96-c5d59165dca4','Leve, com a barriga tranquila',ARRAY['302bcdb1-8101-43be-cb11-8f46761a5f5c'],4) on conflict (id) do nothing;
insert into quiz_questions (id,template_id,text,position,weight) values ('b5a4a14a-811f-4ac8-83a3-8a2e485d494c','10000000-0000-0000-0000-000000000001','Qual dessas frases mais combina com o que você está buscando agora?',14,2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('34798c85-ed4b-471e-914e-c50132bd2a82','b5a4a14a-811f-4ac8-83a3-8a2e485d494c','"Eu preciso descansar de verdade"',ARRAY['4a765786-46cd-480f-875d-1a19532e56d0'],1) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('6a0e621b-3305-4931-1c75-b15cd6a893da','b5a4a14a-811f-4ac8-83a3-8a2e485d494c','"Eu preciso ter mais energia"',ARRAY['c93e5fb3-1966-4dc2-eb8b-3b40d944984f'],2) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('90b69103-3d8e-4f0b-af89-b8e762a3b05c','b5a4a14a-811f-4ac8-83a3-8a2e485d494c','"Eu preciso me sentir mais forte"',ARRAY['83434126-884e-4954-444c-47ffbc54e5a3'],3) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('1e0a22c5-11b5-43ef-f233-a38cb402296e','b5a4a14a-811f-4ac8-83a3-8a2e485d494c','"Eu preciso de mais leveza"',ARRAY['302bcdb1-8101-43be-cb11-8f46761a5f5c'],4) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('9fc79a79-ed44-4999-dd75-9405a6d95006','b5a4a14a-811f-4ac8-83a3-8a2e485d494c','"Eu quero me sentir bonito(a) por dentro e por fora"',ARRAY['487d71ac-9f11-48e3-e6f3-c1567b5252e1'],5) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('55049e44-6eeb-4a17-e0c1-011902866ac8','b5a4a14a-811f-4ac8-83a3-8a2e485d494c','"Eu quero equilíbrio e paz de espírito"',ARRAY['895a8e07-77ee-40c6-0de6-4cdeee09687f'],6) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('b3ec8669-ae0c-4f7f-af58-79c93d1386d8','b5a4a14a-811f-4ac8-83a3-8a2e485d494c','"Eu quero evoluir fisicamente"',ARRAY['ab277a59-5fae-4e2e-8902-1823e33381ce'],7) on conflict (id) do nothing;
insert into quiz_options (id,question_id,text,profile_ids,position) values ('37c15f05-40bf-4595-4903-c5fc7f7d9f06','b5a4a14a-811f-4ac8-83a3-8a2e485d494c','"Eu quero cuidar melhor do meu corpo"',ARRAY['cdd94074-73af-4b7b-23f4-32f0421b9ffc'],8) on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('7361d2f3-a57e-4194-e16c-e4feab524eae','10000000-0000-0000-0000-000000000001','Kit Sono Tranquilo','suplemento_oral','Para ajudar a mente a desacelerar e o corpo a entrar no ritmo certo do sono. Uma combinação calma para a noite.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('957d0208-b19a-4ed6-b999-f726262137b5','10000000-0000-0000-0000-000000000001','Magnésio Relax','suplemento_oral','O clássico aliado do descanso. Ajuda a relaxar a musculatura e acalmar o sistema nervoso ao fim do dia.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('df748341-8233-45f8-5f32-565ee04a9a83','10000000-0000-0000-0000-000000000001','Kit Noite Reparadora','kit_mensal','Os dois anteriores juntos em um protocolo de 30 dias para noites mais profundas e manhãs com mais vontade.',true,11990,'O kit que une o cuidado do sono com a tranquilidade que você merece.')
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('ac01ac98-1681-4eeb-46a4-4f01c179a8c2','10000000-0000-0000-0000-000000000001','Energia do Dia','suplemento_oral','Nutrientes que ajudam seu corpo a transformar alimento em energia de verdade, sem depender só de café.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('31296275-5690-4372-8e2e-30eaec07183d','10000000-0000-0000-0000-000000000001','Disposição Natural','suplemento_oral','Uma ajuda natural contra o cansaço físico e mental, para os dias mais corridos.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('a76df249-f6fe-4ae0-ab57-dc3b5d45565a','10000000-0000-0000-0000-000000000001','Kit Dia Cheio','kit_mensal','Os dois maiores aliados da disposição em um único protocolo para enfrentar a rotina com mais gás.',true,NULL,'Toda a energia que você precisa, em um só cuidado.')
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('0022a3a8-67e8-4651-a183-8e4e17b57e02','10000000-0000-0000-0000-000000000001','Defesas do Corpo','suplemento_oral','Vitaminas e minerais que fortalecem suas defesas naturais, dentro da dose diária recomendada.',false,13490,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('cd6e87bd-12c0-439a-e2c9-8507133c0017','10000000-0000-0000-0000-000000000001','Proteção Diária','suplemento_oral','Zinco e vitaminas que ajudam na recuperação e deixam o corpo mais preparado para as mudanças de estação.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('56bb07ca-8a3f-4b8a-9b80-4c279a280f9e','10000000-0000-0000-0000-000000000001','Kit Proteção Total','kit_mensal','O reforço completo para sentir o corpo mais forte e protegido o mês inteiro.',true,NULL,'A proteção completa para o seu corpo se sentir forte o mês inteiro.')
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('c4c49202-d729-4320-e1b9-e8715381184f','10000000-0000-0000-0000-000000000001','Barriga Leve','suplemento_oral','Probióticos e enzimas que ajudam seu intestino a trabalhar melhor e a digestão a ficar mais confortável.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('a43d13c1-3383-4653-fe4c-c1a2a36e52c2','10000000-0000-0000-0000-000000000001','Flora em Equilíbrio','suplemento_oral','Prebióticos e fibras que alimentam as bactérias boas do intestino, promovendo leveza e regularidade.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('56357c21-1073-4d37-979e-fb428ad011e2','10000000-0000-0000-0000-000000000001','Kit Leve & Equilibrado','kit_mensal','A dupla perfeita para dizer adeus ao inchaço e curtir as refeições sem desconforto.',true,NULL,'Leveza e conforto para o dia a dia, refeição após refeição.')
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('ca1c1842-9165-47d4-81e6-1e25eba78db0','10000000-0000-0000-0000-000000000001','Colágeno + Brilho','suplemento_oral','Colágeno hidrolisado com vitamina C para ajudar a pele a ficar mais firme e luminosa.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('742097b3-577e-422a-8afb-fc3af679dc92','10000000-0000-0000-0000-000000000001','Sérum de Vitamina C','dermocosmetico','O toque externo que potencializa o cuidado: um sérum leve com vitamina C para o rosto.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('a5c869ea-d814-45ad-70c7-56da30aab2fe','10000000-0000-0000-0000-000000000001','Kit Pele de Dentro pra Fora','kit_mensal','O cuidado completo: colágeno por dentro e o sérum por fora, para um brilho de verdade.',true,NULL,'Beleza que vem de dentro, pele e cabelo com mais vida.')
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('e57cf272-9d09-4334-767b-3a343fb12198','10000000-0000-0000-0000-000000000001','Equilíbrio do Dia','suplemento_oral','Uma combinação de ervas e nutrientes que ajudam o corpo a lidar melhor com o estresse do dia a dia.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('2e806ebb-05ee-42c6-be63-e36d5bbbe10b','10000000-0000-0000-0000-000000000001','Bom Humor Natural','suplemento_oral','Magnésio e vitaminas que ajudam a manter o humor mais estável, principalmente naqueles dias difíceis.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('2b8d16a5-991a-47d1-f7d8-f4f16a43e0c7','10000000-0000-0000-0000-000000000001','Kit Centro em Equilíbrio','kit_mensal','Para encontrar estabilidade emocional e leveza mesmo nos dias mais intensos.',true,NULL,'Estabilidade e paz de espírito em um único cuidado.')
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('87101213-5d7c-44d0-4c00-a675a3e5a22a','10000000-0000-0000-0000-000000000001','Creatina Força','suplemento_oral','Creatina monoidratada para ajudar na força, na potência e no ganho de massa magra.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('50a94469-a348-47f7-83f1-2ac541693b32','10000000-0000-0000-0000-000000000001','Recuperação Muscular','suplemento_oral','Proteína e aminoácidos que ajudam o músculo a se recuperar e crescer após o treino.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('091f58f5-717a-4835-b1cb-5aca40155ca4','10000000-0000-0000-0000-000000000001','Kit Treino Completo','kit_mensal','Creatina + recuperação juntas para evoluir no treino e recuperar mais rápido.',true,NULL,'Força e recuperação para evoluir no seu treino.')
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('d66ca583-a435-40ed-9323-aa5586d91d94','10000000-0000-0000-0000-000000000001','Metabolismo em Dia','suplemento_oral','Uma ajuda natural para o corpo gastar energia de forma equilibrada, junto com a dieta.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('540b42f2-e37a-423e-0f79-a9c80c625961','10000000-0000-0000-0000-000000000001','Controle da Fome','suplemento_oral','Fibras que dão saciedade e ajudam a segurar a fome entre as refeições, sem beliscar.',false,NULL,NULL)
on conflict (id) do nothing;
insert into products (id,template_id,name,category,description,is_kit,price_cents,support_text)
values ('2dcea2f5-1187-4021-dee6-59757d04b792','10000000-0000-0000-0000-000000000001','Kit Metabolismo Ativo','kit_mensal','A dupla que apoia seu corpo a trabalhar a favor da dieta, com fome controlada e mais energia.',true,NULL,'Seu corpo trabalhando a favor da dieta, com fome controlada.')
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('aa1e4020-7d42-4a48-98bb-87a6d469605c','10000000-0000-0000-0000-000000000001','4a765786-46cd-480f-875d-1a19532e56d0','7361d2f3-a57e-4194-e16c-e4feab524eae',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('7dec3504-4c8d-4207-1af7-3d7728863055','10000000-0000-0000-0000-000000000001','4a765786-46cd-480f-875d-1a19532e56d0','957d0208-b19a-4ed6-b999-f726262137b5',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('fc71e243-89d8-4678-a6a6-9948b9cb398d','10000000-0000-0000-0000-000000000001','4a765786-46cd-480f-875d-1a19532e56d0','df748341-8233-45f8-5f32-565ee04a9a83',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('1129bae2-39c8-4319-2f39-5146c513af40','10000000-0000-0000-0000-000000000001','c93e5fb3-1966-4dc2-eb8b-3b40d944984f','ac01ac98-1681-4eeb-46a4-4f01c179a8c2',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('73da0383-f784-4aeb-0e54-6fdd7e02dc93','10000000-0000-0000-0000-000000000001','c93e5fb3-1966-4dc2-eb8b-3b40d944984f','31296275-5690-4372-8e2e-30eaec07183d',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('f9114eb5-294c-4437-cf5d-36ec34436800','10000000-0000-0000-0000-000000000001','c93e5fb3-1966-4dc2-eb8b-3b40d944984f','a76df249-f6fe-4ae0-ab57-dc3b5d45565a',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('41521db4-864b-4ad4-2b65-36b5db524342','10000000-0000-0000-0000-000000000001','83434126-884e-4954-444c-47ffbc54e5a3','0022a3a8-67e8-4651-a183-8e4e17b57e02',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('68f70fa9-b134-47bf-c160-1d96337bf407','10000000-0000-0000-0000-000000000001','83434126-884e-4954-444c-47ffbc54e5a3','cd6e87bd-12c0-439a-e2c9-8507133c0017',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('6f1a0ec7-5997-451f-96da-501773851246','10000000-0000-0000-0000-000000000001','83434126-884e-4954-444c-47ffbc54e5a3','56bb07ca-8a3f-4b8a-9b80-4c279a280f9e',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('8cbd34ed-bb7b-4a09-1c93-88e58d0e8df1','10000000-0000-0000-0000-000000000001','302bcdb1-8101-43be-cb11-8f46761a5f5c','c4c49202-d729-4320-e1b9-e8715381184f',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('1b697ec7-8c11-450a-2db8-540fb46bb7b9','10000000-0000-0000-0000-000000000001','302bcdb1-8101-43be-cb11-8f46761a5f5c','a43d13c1-3383-4653-fe4c-c1a2a36e52c2',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('82b180ba-cb85-4f2b-3df7-10b2fb95300e','10000000-0000-0000-0000-000000000001','302bcdb1-8101-43be-cb11-8f46761a5f5c','56357c21-1073-4d37-979e-fb428ad011e2',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('45838251-e9c2-4daf-3cdb-b2fbb9bef9f8','10000000-0000-0000-0000-000000000001','487d71ac-9f11-48e3-e6f3-c1567b5252e1','ca1c1842-9165-47d4-81e6-1e25eba78db0',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('bcae3197-5702-4473-991a-817573bf3d07','10000000-0000-0000-0000-000000000001','487d71ac-9f11-48e3-e6f3-c1567b5252e1','742097b3-577e-422a-8afb-fc3af679dc92',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('fbadba4e-2570-4af2-14a6-c75967aea2a3','10000000-0000-0000-0000-000000000001','487d71ac-9f11-48e3-e6f3-c1567b5252e1','a5c869ea-d814-45ad-70c7-56da30aab2fe',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('9ef3b62e-782c-4fd7-814e-4876b43c98d0','10000000-0000-0000-0000-000000000001','895a8e07-77ee-40c6-0de6-4cdeee09687f','e57cf272-9d09-4334-767b-3a343fb12198',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('fd4df9de-10e5-4661-74fe-b75814d33ac8','10000000-0000-0000-0000-000000000001','895a8e07-77ee-40c6-0de6-4cdeee09687f','2e806ebb-05ee-42c6-be63-e36d5bbbe10b',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('a22b6c76-2891-465f-aba0-c712ec401d17','10000000-0000-0000-0000-000000000001','895a8e07-77ee-40c6-0de6-4cdeee09687f','2b8d16a5-991a-47d1-f7d8-f4f16a43e0c7',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('e2e57c64-9141-499c-d789-ce942ec1f796','10000000-0000-0000-0000-000000000001','ab277a59-5fae-4e2e-8902-1823e33381ce','87101213-5d7c-44d0-4c00-a675a3e5a22a',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('8e51d47c-9b49-4b22-c883-60724ee37d04','10000000-0000-0000-0000-000000000001','ab277a59-5fae-4e2e-8902-1823e33381ce','50a94469-a348-47f7-83f1-2ac541693b32',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('6fa78e4b-e896-468c-6510-f7c1eb49b26f','10000000-0000-0000-0000-000000000001','ab277a59-5fae-4e2e-8902-1823e33381ce','091f58f5-717a-4835-b1cb-5aca40155ca4',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('fa47e63a-69c9-4e98-a5e9-ac197848aaa3','10000000-0000-0000-0000-000000000001','cdd94074-73af-4b7b-23f4-32f0421b9ffc','d66ca583-a435-40ed-9323-aa5586d91d94',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('7d84b754-6a56-4636-a47e-977f04ba91bf','10000000-0000-0000-0000-000000000001','cdd94074-73af-4b7b-23f4-32f0421b9ffc','540b42f2-e37a-423e-0f79-a9c80c625961',0,true)
on conflict (id) do nothing;
insert into template_profile_products (id,template_id,profile_id,product_id,position,is_primary) values ('0e3b6214-833b-444e-0306-691fcd2466eb','10000000-0000-0000-0000-000000000001','cdd94074-73af-4b7b-23f4-32f0421b9ffc','2dcea2f5-1187-4021-dee6-59757d04b792',0,true)
on conflict (id) do nothing;