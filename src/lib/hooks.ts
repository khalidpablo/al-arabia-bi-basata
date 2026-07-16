import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import type { Student, Lesson, Quiz, Notification } from '../types';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('points', { ascending: false });
    if (!error && data) setStudents(data as Student[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel('students-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => fetch())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch]);

  return { students, loading, refetch: fetch };
}

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setLessons(data as Lesson[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel('lessons-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, () => fetch())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch]);

  return { lessons, loading, refetch: fetch };
}

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setQuizzes(data as Quiz[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel('quizzes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quizzes' }, () => fetch())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch]);

  return { quizzes, loading, refetch: fetch };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setNotifications(data as Notification[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel('noti-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetch())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch]);

  return { notifications, loading, refetch: fetch };
}
