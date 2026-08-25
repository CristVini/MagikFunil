import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente necessárias:');
  console.error('   VITE_SUPABASE_URL (ou SUPABASE_URL)');
  console.error('   SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SERVICE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Ler seed JSON
const seedPath = path.join(__dirname, '..', 'seed_encapsulados_nutraceuticos.json');
const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const TEMPLATE_ID = seedData.template.id;

async function seed() {
  console.log('🌱 Iniciando seed do template: Encapsulados Nutracêuticos');
  console.log('Template ID:', TEMPLATE_ID);

  try {
    // 1. Inserir Template
    console.log('\n1️⃣ Inserindo template...');
    const { error: templateError } = await supabase
      .from('templates')
      .upsert({
        id: seedData.template.id,
        slug: seedData.template.slug,
        name: seedData.template.name,
        niche: seedData.template.niche,
        description: seedData.template.description,
        version: seedData.template.version,
        is_active: seedData.template.is_active,
      }, { onConflict: 'id' });
    
    if (templateError) throw templateError;
    console.log('   ✅ Template inserido');

    // 2. Inserir Perfis
    console.log('\n2️⃣ Inserindo perfis (8)...');
    for (const profile of seedData.profiles) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          template_id: TEMPLATE_ID,
          name: profile.name,
          archetype: profile.archetype,
          description: profile.description,
          scientific_basis: profile.scientific_basis,
          expected_effect: profile.expected_effect,
          references: profile.references,
          notes: profile.notes,
          color: profile.color,
          display_order: profile.display_order,
        }, { onConflict: 'id' });
      
      if (error) throw error;
      console.log(`   ✅ ${profile.name}`);
    }

    // 3. Inserir Perguntas do Quiz
    console.log('\n3️⃣ Inserindo perguntas do quiz (14)...');
    for (const question of seedData.quiz_questions) {
      const { error: qError } = await supabase
        .from('quiz_questions')
        .upsert({
          id: question.id,
          template_id: TEMPLATE_ID,
          text: question.text,
          position: question.position,
          weight: question.weight || 1,
        }, { onConflict: 'id' });
      
      if (qError) throw qError;

      // Inserir opções
      for (const option of question.options) {
        const { error: oError } = await supabase
          .from('quiz_options')
          .upsert({
            question_id: question.id,
            text: option.text,
            profile_ids: option.profile_ids,
            position: option.position,
          }, { onConflict: 'question_id,position' });
        
        if (oError) throw oError;
      }
      console.log(`   ✅ ${question.text.substring(0, 50)}...`);
    }

    // 4. Inserir Produtos
    console.log('\n4️⃣ Inserindo produtos (20)...');
    for (const product of seedData.products) {
      const { error } = await supabase
        .from('products')
        .upsert({
          id: product.id,
          template_id: TEMPLATE_ID,
          name: product.name,
          category: product.category,
          description: product.description,
          key_actives: product.key_actives,
          image_url: product.image_url,
          display_order: product.display_order,
        }, { onConflict: 'id' });
      
      if (error) throw error;
      console.log(`   ✅ ${product.name}`);
    }

    // 5. Inserir Mapeamentos Perfil → Produtos
    console.log('\n5️⃣ Inserindo mapeamentos perfil → produtos...');
    for (const mapping of seedData.template_profile_products) {
      const { error } = await supabase
        .from('template_profile_products')
        .upsert({
          template_id: TEMPLATE_ID,
          profile_id: mapping.profile_id,
          product_id: mapping.product_id,
          position: mapping.position,
          is_primary: mapping.is_primary,
        }, { onConflict: 'template_id,profile_id,product_id' });
      
      if (error) throw error;
    }
    console.log(`   ✅ ${seedData.template_profile_products.length} mapeamentos inseridos`);

    console.log('\n✅✅✅ Seed concluído com sucesso!');
    console.log('\nResumo:');
    console.log(`  - 1 Template: ${seedData.template.name}`);
    console.log(`  - ${seedData.profiles.length} Perfis`);
    console.log(`  - ${seedData.quiz_questions.length} Perguntas do Quiz`);
    console.log(`  - ${seedData.products.length} Produtos`);
    console.log(`  - ${seedData.template_profile_products.length} Mapeamentos Perfil→Produto`);

  } catch (error) {
    console.error('\n❌ Erro durante seed:', error);
    process.exit(1);
  }
}

seed();