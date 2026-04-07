import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Macro, Trigger, Action, HttpRequestActionConfig, NotificationTriggerConfig } from '@/types';
import { useMacroStore } from '@/store/macros';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CreateMacroScreen() {
  const params = useLocalSearchParams();
  const existingMacro = params.id ? useMacroStore.getState().getMacro(params.id as string) : null;

  const [name, setName] = useState(existingMacro?.name || '');
  const [packageFilter, setPackageFilter] = useState(
    (existingMacro?.triggers[0]?.config as NotificationTriggerConfig)?.packageFilter || ''
  );
  const [httpUrl, setHttpUrl] = useState(
    (existingMacro?.actions[0]?.config as HttpRequestActionConfig)?.url || ''
  );
  const [httpMethod, setHttpMethod] = useState(
    (existingMacro?.actions[0]?.config as HttpRequestActionConfig)?.method || 'POST'
  );
  const [httpBody, setHttpBody] = useState(
    (existingMacro?.actions[0]?.config as HttpRequestActionConfig)?.body || ''
  );
  const [httpContentType, setHttpContentType] = useState(
    (existingMacro?.actions[0]?.config as HttpRequestActionConfig)?.contentType || 'application/json'
  );

  const { addMacro, updateMacro } = useMacroStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a macro name');
      return;
    }
    if (!httpUrl.trim()) {
      Alert.alert('Error', 'Please enter an HTTP URL');
      return;
    }

    const trigger: Trigger = {
      type: 'notification',
      config: {
        packageFilter: packageFilter || undefined,
      } as NotificationTriggerConfig,
    };

    const action: Action = {
      type: 'http_request',
      config: {
        url: httpUrl,
        method: httpMethod as any,
        body: httpBody || undefined,
        contentType: httpContentType,
      } as HttpRequestActionConfig,
      order: 0,
    };

    const macro: Macro = {
      id: existingMacro?.id || `macro_${Date.now()}`,
      name: name.trim(),
      enabled: existingMacro?.enabled ?? true,
      triggers: [trigger],
      actions: [action],
      createdAt: existingMacro?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (existingMacro) {
      await updateMacro(macro.id, macro);
    } else {
      await addMacro(macro);
    }

    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Macro Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="e.g., Forward WhatsApp notifications"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Trigger: Notification</Text>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Fires when a notification is received
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Package name (empty = all apps)"
          placeholderTextColor={colors.textSecondary}
          value={packageFilter}
          onChangeText={setPackageFilter}
        />
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          e.g., com.whatsapp, com.telegram
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Action: HTTP Request</Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="URL (e.g., https://webhook.site/...)"
          placeholderTextColor={colors.textSecondary}
          value={httpUrl}
          onChangeText={setHttpUrl}
          autoCapitalize="none"
          keyboardType="url"
        />

        <View style={styles.methodRow}>
          <Text style={[styles.methodLabel, { color: colors.text }]}>Method:</Text>
          <View style={styles.methodButtons}>
            {(['GET', 'POST', 'PUT', 'DELETE'] as const).map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodBtn,
                  httpMethod === method && { backgroundColor: colors.tint },
                ]}
                onPress={() => setHttpMethod(method)}>
                <Text
                  style={[
                    styles.methodBtnText,
                    { color: httpMethod === method ? '#fff' : colors.textSecondary },
                  ]}>
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TextInput
          style={[styles.input, styles.bodyInput, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Body (optional). Use {{title}}, {{text}}, {{packageName}}"
          placeholderTextColor={colors.textSecondary}
          value={httpBody}
          onChangeText={setHttpBody}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Variables: {'{{title}}'}, {'{{text}}'}, {'{{packageName}}'}, {'{{timestamp}}'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.tint }]}
        onPress={handleSave}>
        <Text style={styles.saveBtnText}>{existingMacro ? 'Update' : 'Create'} Macro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  sectionDesc: { fontSize: 14, marginBottom: 12 },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  bodyInput: { minHeight: 100 },
  hint: { fontSize: 12, marginTop: 4 },
  methodRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  methodLabel: { fontSize: 14, fontWeight: '600', marginRight: 12 },
  methodButtons: { flexDirection: 'row', gap: 8 },
  methodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  methodBtnText: { fontSize: 12, fontWeight: '600' },
  saveBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
